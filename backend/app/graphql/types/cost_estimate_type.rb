module Types
  class CostEstimateType < Types::BaseObject
    description "Cost estimate result"

    field :id, ID, null: false
    field :referral_id, ID, null: false
    field :category, String, null: true
    field :rule_key, String, null: true
    field :explanation_text, String, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end


