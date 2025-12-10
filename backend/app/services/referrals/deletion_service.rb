module Referrals
  class DeletionService
    def initialize(referral)
      @referral = referral
    end

    def purge_phi!
      Referral.transaction do
        destroy_associations
        @referral.update!(
          status: "deleted",
          risk_flag: false,
          packet_status: nil,
          last_completed_step: nil,
          last_updated_step_at: nil,
          submitted_at: nil,
          withdrawn_at: nil,
          scheduled_date: nil,
          scheduled_time: nil,
          clinician_name: nil,
          session_type: nil,
          deletion_requested_at: nil
        )
      end
      true
    rescue StandardError => e
      Rails.logger.error("PHI purge failed for referral #{@referral.id}: #{e.message}")
      false
    end

    private

    def destroy_associations
      delete_insurance_upload_files
      delete_packet_pdf
      @referral.intake_response&.destroy!
      @referral.ai_screener_session&.destroy!
      @referral.insurance_detail&.destroy!
      @referral.insurance_uploads.destroy_all
      @referral.cost_estimate&.destroy!
      @referral.scheduling_preference&.destroy!
      @referral.consent_records.destroy_all
      @referral.referral_packet&.destroy!
      @referral.support_chats.destroy_all
      @referral.referral_notes.destroy_all
      @referral.notifications.destroy_all
    end

    def delete_packet_pdf
      pdf_key = @referral.referral_packet&.pdf_s3_key
      return unless pdf_key.present?

      s3_client.delete(pdf_key)
    rescue StandardError => e
      Rails.logger.warn("Failed to delete packet PDF for referral #{@referral.id}: #{e.message}")
    end

    def delete_insurance_upload_files
      @referral.insurance_uploads.each do |upload|
        [upload.front_image_s3_key, upload.back_image_s3_key].compact.each do |key|
          s3_client.delete(key)
        rescue StandardError => e
          Rails.logger.warn("Failed to delete insurance upload #{key} for referral #{@referral.id}: #{e.message}")
        end
      end
    end

    def s3_client
      @s3_client ||= Storage::S3Client.new
    end
  end
end


