class Contract < ApplicationRecord
  has_many :org_contracts
  has_many :organizations, through: :org_contracts
  has_many :referrals
end

