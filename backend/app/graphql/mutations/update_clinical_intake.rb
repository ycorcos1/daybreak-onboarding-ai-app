module Mutations
  class UpdateClinicalIntake < Mutations::BaseMutation
    argument :referral_id, ID, required: true
    argument :intake_input, Types::Inputs::ClinicalIntakeInput, required: true

    field :intake_response, Types::IntakeResponseType, null: true
    field :referral, Types::ReferralType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:, intake_input:)
      require_parent!

      referral = current_user.referrals.find_by(id: referral_id)
      return { intake_response: nil, referral: nil, errors: ["Referral not found"] } unless referral

      intake_response = referral.intake_response || referral.build_intake_response

      if intake_response.update(responses: intake_input[:responses])
        referral.update(last_completed_step: "intake", last_updated_step_at: Time.current)
        { intake_response: intake_response, referral: referral, errors: [] }
      else
        { intake_response: nil, referral: nil, errors: intake_response.errors.full_messages }
      end
    end
  end
end


