class ClinicianCredentialedInsurance < ApplicationRecord
  belongs_to :clinician
  belongs_to :credentialed_insurance
end

