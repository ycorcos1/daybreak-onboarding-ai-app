module Mutations
  class RecordAppointmentDetails < Mutations::BaseMutation
    argument :referral_id, ID, required: true
    argument :scheduled_date, GraphQL::Types::ISO8601Date, required: true
    argument :scheduled_time, String, required: true
    argument :clinician_name, String, required: true
    argument :session_type, String, required: true

    field :referral, Types::ReferralType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:, scheduled_date:, scheduled_time:, clinician_name:, session_type:)
      require_admin!

      referral = Referral.find_by(id: referral_id)
      return { referral: nil, errors: ["Referral not found"] } unless referral
      return { referral: nil, errors: ["Referral must be scheduled to record details"] } unless referral.status == "scheduled"

      unless Referral::SESSION_TYPES.include?(session_type)
        return { referral: nil, errors: ["Invalid session type"] }
      end

      if referral.update(
        scheduled_date: scheduled_date,
        scheduled_time: scheduled_time,
        clinician_name: clinician_name,
        session_type: session_type
      )
        { referral: referral, errors: [] }
      else
        { referral: nil, errors: referral.errors.full_messages }
      end
    rescue StandardError => e
      Rails.logger.error("Failed to record appointment details: #{e.message}")
      { referral: nil, errors: ["Unable to record appointment details"] }
    end
  end
end


