module Mutations
  class AcceptConsents < Mutations::BaseMutation
    argument :referral_id, ID, required: true
    argument :consents, [Types::Inputs::ConsentInput], required: true

    field :consent_records, [Types::ConsentRecordType], null: true
    field :referral, Types::ReferralType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:, consents:)
      require_parent!

      referral = current_user.referrals.find_by(id: referral_id)
      return { consent_records: nil, referral: nil, errors: ["Referral not found"] } unless referral

      saved_records = []
      errors = []

      consents.each do |consent_input|
        record = referral.consent_records.find_or_initialize_by(consent_type: consent_input[:consent_type])
        record.assign_attributes(consent_input.to_h)

        if record.save
          saved_records << record
        else
          errors.concat(record.errors.full_messages)
        end
      end

      if errors.empty?
        required_types = ConsentRecord::CONSENT_TYPES
        existing_types = referral.consent_records.pluck(:consent_type)
        all_present = (required_types - existing_types).empty?
        referral.update(
          last_completed_step: all_present ? "consent" : referral.last_completed_step,
          last_updated_step_at: Time.current
        )
        { consent_records: saved_records, referral: referral, errors: [] }
      else
        { consent_records: nil, referral: nil, errors: errors }
      end
    end
  end
end
