module Types
  class SupportChatType < Types::BaseObject
    description "Support chat thread"

    field :id, ID, null: false
    field :referral_id, ID, null: true
    field :parent_user_id, ID, null: false
    field :mode, String, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :support_chat_messages, [Types::SupportChatMessageType], null: false

    def support_chat_messages
      object.support_chat_messages.order(:created_at)
    end
  end
end


