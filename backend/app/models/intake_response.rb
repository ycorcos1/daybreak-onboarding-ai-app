class IntakeResponse < ApplicationRecord
  belongs_to :referral

  validates :referral, presence: true
  validates :referral_id, uniqueness: true
end

