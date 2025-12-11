class Clinician < ApplicationRecord
  belongs_to :user, optional: true
  has_many :clinician_credentialed_insurances
  has_many :credentialed_insurances, through: :clinician_credentialed_insurances
  has_many :clinician_availabilities
end

