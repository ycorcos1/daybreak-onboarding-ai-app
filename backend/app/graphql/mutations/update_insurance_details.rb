module Mutations
  class UpdateInsuranceDetails < Mutations::BaseMutation
    argument :referral_id, ID, required: true
    argument :insurance_input, Types::Inputs::InsuranceDetailInput, required: true

    field :insurance_detail, Types::InsuranceDetailType, null: true
    field :referral, Types::ReferralType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:, insurance_input:)
      require_parent!

      referral = current_user.referrals.find_by(id: referral_id)
      return { insurance_detail: nil, referral: nil, errors: ["Referral not found"] } unless referral

      insurance_detail = referral.insurance_detail || referral.build_insurance_detail

      if insurance_detail.update(insurance_input.to_h)
        referral.update(last_completed_step: "insurance", last_updated_step_at: Time.current)
        Billing::CostEstimator.new(referral: referral).estimate rescue nil
        { insurance_detail: insurance_detail, referral: referral, errors: [] }
      else
        { insurance_detail: nil, referral: nil, errors: insurance_detail.errors.full_messages }
      end
    end
  end
end


