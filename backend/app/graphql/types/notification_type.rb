module Types
  class NotificationType < Types::BaseObject
    description "In-app notification"

    field :id, ID, null: false
    field :user_id, ID, null: false
    field :referral_id, ID, null: true
    field :notification_type, String, null: false
    field :payload_jsonb, GraphQL::Types::JSON, null: false
    field :read_at, GraphQL::Types::ISO8601DateTime, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end


