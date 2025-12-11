module Types
  module Inputs
    class ClinicianFilterInput < Types::BaseInputObject
      description "Filters for clinician search"

      argument :active, Boolean, required: false
      argument :credentialed_insurance_id, ID, required: false
      argument :license_state, String, required: false
    end
  end
end


