module Mutations
  class RecalculateCostEstimate < Mutations::BaseMutation
    argument :referral_id, ID, required: true

    field :cost_estimate, Types::CostEstimateType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:)
      require_parent!

      referral = current_user.referrals.find_by(id: referral_id)
      return { cost_estimate: nil, errors: ["Referral not found"] } unless referral

      estimate = Billing::CostEstimator.new(referral: referral).estimate
      { cost_estimate: referral.cost_estimate, errors: [] }
    rescue StandardError => e
      { cost_estimate: nil, errors: [e.message] }
    end
  end
end

