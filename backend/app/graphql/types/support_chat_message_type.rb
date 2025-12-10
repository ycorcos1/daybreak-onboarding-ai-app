module Types
  class SupportChatMessageType < Types::BaseObject
    description "Support chat message"

    field :id, ID, null: false
    field :chat_id, ID, null: false
    field :sender_type, Types::SenderTypeEnum, null: false
    field :message_text, String, null: false
    field :metadata_jsonb, GraphQL::Types::JSON, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end


