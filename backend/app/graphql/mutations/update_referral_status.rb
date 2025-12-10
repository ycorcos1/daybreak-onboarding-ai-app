module Mutations
  class UpdateReferralStatus < Mutations::BaseMutation
    argument :referral_id, ID, required: true
    argument :status, Types::ReferralStatusEnum, required: true

    field :referral, Types::ReferralType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:, status:)
      require_admin!

      referral = Referral.find_by(id: referral_id)
      return { referral: nil, errors: ["Referral not found"] } unless referral

      service = Referrals::StatusTransitionService.new(referral: referral, admin_user: current_user)
      service.transition!(status)

      { referral: referral.reload, errors: [] }
    rescue Referrals::StatusTransitionService::InvalidTransition => e
      { referral: nil, errors: [e.message] }
    rescue StandardError => e
      Rails.logger.error("Failed to update referral status: #{e.message}")
      { referral: nil, errors: ["Unable to update referral status"] }
    end
  end
end


