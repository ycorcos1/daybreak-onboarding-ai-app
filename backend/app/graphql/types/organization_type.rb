module Types
  class OrganizationType < Types::BaseObject
    description "Organization (district or school)"

    field :id, ID, null: false
    field :name, String, null: true
    field :slug, String, null: true
    field :kind, Integer, null: true
    field :tzdb, String, null: true
    field :internal_name, String, null: true
    field :parent_organization, Types::OrganizationType, null: true
    field :contracts, [Types::ContractType], null: false
  end
end


