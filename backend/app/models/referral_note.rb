class ReferralNote < ApplicationRecord
  belongs_to :referral
  belongs_to :admin_user, class_name: "User"

  validates :referral, presence: true
  validates :admin_user, presence: true
  validates :note_text, presence: true
end

