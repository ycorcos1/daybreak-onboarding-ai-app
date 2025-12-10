module Mutations
  class UpdateReferralStep < Mutations::BaseMutation
    argument :referral_id, ID, required: true
    argument :step_name, String, required: true
    argument :step_data, GraphQL::Types::JSON, required: false

    field :referral, Types::ReferralType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:, step_name:, step_data: nil)
      require_parent!

      referral = current_user.referrals.find_by(id: referral_id)
      return { referral: nil, errors: ["Referral not found"] } unless referral

      unless Referral::ONBOARDING_STEPS.include?(step_name)
        return { referral: nil, errors: ["Invalid step"] }
      end

      referral.update(
        last_completed_step: step_name,
        last_updated_step_at: Time.current
      )

      { referral: referral, errors: [] }
    rescue StandardError => e
      { referral: nil, errors: [e.message] }
    end
  end
end


