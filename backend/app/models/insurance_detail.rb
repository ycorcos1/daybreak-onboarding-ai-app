class InsuranceDetail < ApplicationRecord
  INSURANCE_STATUSES = %w[insured medicaid uninsured not_sure].freeze
  SOURCES = %w[ocr manual both].freeze

  belongs_to :referral

  validates :referral, presence: true
  validates :referral_id, uniqueness: true
  validates :insurance_status, presence: true, inclusion: { in: INSURANCE_STATUSES }
  validates :source, inclusion: { in: SOURCES }, allow_nil: true
end

