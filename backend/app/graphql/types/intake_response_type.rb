module Types
  class IntakeResponseType < Types::BaseObject
    description "Structured clinical intake responses"

    field :id, ID, null: false
    field :referral_id, ID, null: false
    field :responses, GraphQL::Types::JSON, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end


