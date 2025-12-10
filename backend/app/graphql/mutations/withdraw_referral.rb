module Mutations
  class WithdrawReferral < Mutations::BaseMutation
    argument :referral_id, ID, required: true

    field :referral, Types::ReferralType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:)
      require_parent!

      referral = current_user.referrals.find_by(id: referral_id)
      return { referral: nil, errors: ["Referral not found"] } unless referral

      service = Referrals::StatusTransitionService.new(referral: referral, admin_user: nil)
      service.transition!("withdrawn")

      { referral: referral.reload, errors: [] }
    rescue Referrals::StatusTransitionService::InvalidTransition => e
      { referral: nil, errors: [e.message] }
    rescue StandardError => e
      Rails.logger.error("Withdraw referral failed: #{e.message}")
      { referral: nil, errors: ["Unable to withdraw referral"] }
    end
  end
end


