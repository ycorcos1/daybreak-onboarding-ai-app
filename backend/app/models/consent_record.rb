class ConsentRecord < ApplicationRecord
  CONSENT_TYPES = %w[
    terms_of_use
    privacy_policy
    non_emergency_acknowledgment
    telehealth_consent
    guardian_authorization
  ].freeze

  belongs_to :referral

  validates :referral, presence: true
  validates :consent_type, presence: true, inclusion: { in: CONSENT_TYPES }
  validates :accepted_at, presence: true
  validates :consent_type, uniqueness: { scope: :referral_id }
end

