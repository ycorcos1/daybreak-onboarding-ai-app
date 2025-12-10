module Types
  class ConsentRecordType < Types::BaseObject
    description "Consent acknowledgements"

    field :id, ID, null: false
    field :referral_id, ID, null: false
    field :consent_type, Types::ConsentTypeEnum, null: false
    field :accepted_at, GraphQL::Types::ISO8601DateTime, null: false
    field :ip_address, String, null: true
    field :user_agent, String, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end


