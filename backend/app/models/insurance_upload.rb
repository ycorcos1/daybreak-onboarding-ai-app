class InsuranceUpload < ApplicationRecord
  OCR_STATUSES = %w[pending processing complete failed].freeze

  belongs_to :referral

  validates :referral, presence: true
  validates :ocr_status, inclusion: { in: OCR_STATUSES }, allow_nil: true
end

