module Mutations
  class ApproveReferralDeletion < Mutations::BaseMutation
    argument :referral_id, ID, required: true

    field :success, Boolean, null: false
    field :errors, [String], null: false

    def resolve(referral_id:)
      require_admin!

      referral = Referral.find_by(id: referral_id)
      return { success: false, errors: ["Referral not found"] } unless referral
      return { success: false, errors: ["No deletion request pending"] } unless referral.deletion_requested_at.present?

      service = Referrals::DeletionService.new(referral)
      if service.purge_phi!
        Notifications::Dispatcher.deletion_approved(referral: referral, user: referral.user)
        { success: true, errors: [] }
      else
        { success: false, errors: ["Failed to delete referral data"] }
      end
    rescue StandardError => e
      Rails.logger.error("Approve referral deletion failed: #{e.message}")
      { success: false, errors: ["Failed to delete referral data"] }
    end
  end
end


