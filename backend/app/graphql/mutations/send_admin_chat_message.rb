module Mutations
  class SendAdminChatMessage < Mutations::BaseMutation
    description "Send a support chat message from an admin to a parent"

    argument :chat_id, ID, required: true
    argument :message_text, String, required: true

    field :message, Types::SupportChatMessageType, null: true
    field :chat, Types::SupportChatType, null: true
    field :errors, [String], null: false

    def resolve(chat_id:, message_text:)
      require_admin!

      message = Chat::SupportChatService.send_admin_message(
        chat_id: chat_id,
        admin_user: current_user,
        message_text: message_text
      )

      { message: message, chat: message.support_chat, errors: [] }
    rescue Chat::SupportChatService::ChatNotFoundError => e
      { message: nil, chat: nil, errors: [e.message] }
    rescue StandardError => e
      { message: nil, chat: nil, errors: [e.message] }
    end
  end
end

