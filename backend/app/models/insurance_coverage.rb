class InsuranceCoverage < ApplicationRecord
  belongs_to :user
  belongs_to :credentialed_insurance, optional: true
end

