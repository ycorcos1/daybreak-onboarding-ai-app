class Child < ApplicationRecord
  belongs_to :user
  has_many :referrals, dependent: :destroy

  validate :dob_or_age_band_present

  validates :name, presence: true
  validates :grade, presence: true
  validates :school_name, presence: true
  validates :district, presence: true
  validates :user, presence: true

  private

  def dob_or_age_band_present
    return if dob.present? || age_band.present?

    errors.add(:base, "Date of birth or age band must be present")
  end
end

