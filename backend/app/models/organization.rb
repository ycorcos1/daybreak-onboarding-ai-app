class Organization < ApplicationRecord
  belongs_to :parent_organization, class_name: "Organization", optional: true
  has_many :child_organizations, class_name: "Organization", foreign_key: :parent_organization_id
  has_many :org_contracts
  has_many :contracts, through: :org_contracts
  has_many :memberships
  has_many :users, through: :memberships
  has_many :referrals
end

