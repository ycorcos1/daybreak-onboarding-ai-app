class CredentialedInsurance < ApplicationRecord
  has_many :clinician_credentialed_insurances
  has_many :clinicians, through: :clinician_credentialed_insurances
  has_many :insurance_coverages
end

