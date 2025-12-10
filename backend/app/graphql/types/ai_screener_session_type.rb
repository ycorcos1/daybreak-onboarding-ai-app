module Types
  class AiScreenerSessionType < Types::BaseObject
    description "AI screener transcript and summary"

    field :id, ID, null: false
    field :referral_id, ID, null: false
    field :transcript_jsonb, GraphQL::Types::JSON, null: false
    field :summary_jsonb, GraphQL::Types::JSON, null: false
    field :risk_flag, Boolean, null: false
    field :completed_at, GraphQL::Types::ISO8601DateTime, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end


