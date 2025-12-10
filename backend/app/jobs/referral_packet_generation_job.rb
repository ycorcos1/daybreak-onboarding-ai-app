require "stringio"

class ReferralPacketGenerationJob < ApplicationJob
  queue_as :default

  def perform(referral_id)
    referral = Referral.includes(
      :child,
      :user,
      :ai_screener_session,
      :intake_response,
      :insurance_detail,
      :insurance_uploads,
      :cost_estimate,
      :scheduling_preference,
      :consent_records,
      { support_chats: :support_chat_messages },
      { referral_notes: :admin_user }
    ).find(referral_id)

    referral.update!(packet_status: "generating") unless referral.packet_status == "generating"

    packet_json = ReferralPackets::Builder.new(referral).build
    pdf_binary = ReferralPackets::PdfRenderer.new(packet_json).render

    s3_client = Storage::S3Client.new
    s3_key = "referral_packets/#{referral.id}/packet_#{Time.current.to_i}.pdf"
    s3_client.upload(StringIO.new(pdf_binary), s3_key, content_type: "application/pdf")

    referral.upsert_referral_packet!(
      packet_jsonb: packet_json,
      pdf_s3_key: s3_key
    )

    referral.update!(packet_status: "complete")
  rescue StandardError => e
    referral&.update(packet_status: "failed")
    Rails.logger.error("ReferralPacketGenerationJob failed for referral #{referral_id}: #{e.message}")
    raise e
  end
end

