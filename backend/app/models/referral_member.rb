class ReferralMember < ApplicationRecord
  belongs_to :referral
  belongs_to :user
end

