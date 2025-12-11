module Types
  class ClinicianType < Types::BaseObject
    description "Clinician roster entry (reference only, no account)"

    field :id, ID, null: false
    field :user_id, ID, null: true
    field :first_name, String, null: true
    field :last_name, String, null: true
    field :email, String, null: true
    field :phone, String, null: true
    field :license_number, String, null: true
    field :license_state, String, null: true
    field :credentials, String, null: true
    field :profile_data, GraphQL::Types::JSON, null: true
    field :specialties, GraphQL::Types::JSON, null: true
    field :active, Boolean, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: true
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: true

    field :credentialed_insurances, [Types::CredentialedInsuranceType], null: false
    field :clinician_credentialed_insurances, [Types::ClinicianCredentialedInsuranceType], null: false
    field :availabilities, [Types::ClinicianAvailabilityType], null: false, method: :clinician_availabilities
  end
end


