module Types
  class ClinicianCredentialedInsuranceType < Types::BaseObject
    description "Join between clinician and credentialed insurance"

    field :id, ID, null: false
    field :clinician_id, ID, null: false
    field :credentialed_insurance_id, ID, null: false
    field :credentialed_insurance, Types::CredentialedInsuranceType, null: false
  end
end


