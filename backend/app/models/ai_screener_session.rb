class AiScreenerSession < ApplicationRecord
  belongs_to :referral

  validates :referral, presence: true
  validates :referral_id, uniqueness: true

  def completed?
    completed_at.present?
  end
end

