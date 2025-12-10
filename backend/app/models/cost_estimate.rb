class CostEstimate < ApplicationRecord
  CATEGORIES = %w[no_cost copay tbd unknown].freeze

  belongs_to :referral

  validates :referral, presence: true
  validates :referral_id, uniqueness: true
  validates :category, inclusion: { in: CATEGORIES }, allow_nil: true
end

