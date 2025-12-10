module Mutations
  class RejectReferralDeletion < Mutations::BaseMutation
    argument :referral_id, ID, required: true
    argument :reason, String, required: false

    field :referral, Types::ReferralType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:, reason: nil)
      require_admin!

      referral = Referral.find_by(id: referral_id)
      return { referral: nil, errors: ["Referral not found"] } unless referral
      return { referral: nil, errors: ["No deletion request pending"] } unless referral.deletion_requested_at.present?

      Referral.transaction do
        referral.update!(deletion_requested_at: nil)
        Notification.create!(
          user: referral.user,
          referral: referral,
          notification_type: "referral.deletion_rejected",
          payload_jsonb: {
            title: "Deletion request reviewed",
            message: reason.presence || "We are keeping this referral active. Please reach out if you have questions."
          }
        )
      end

      { referral: referral.reload, errors: [] }
    rescue StandardError => e
      Rails.logger.error("Reject referral deletion failed: #{e.message}")
      { referral: nil, errors: ["Unable to reject deletion request"] }
    end
  end
end


