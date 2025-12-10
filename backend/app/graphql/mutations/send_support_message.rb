module Mutations
  class SendSupportMessage < Mutations::BaseMutation
    description "Send a support chat message from a parent. Generates AI replies when appropriate."

    argument :referral_id, ID, required: false
    argument :message_text, String, required: true

    field :chat, Types::SupportChatType, null: true
    field :message, Types::SupportChatMessageType, null: true
    field :ai_message, Types::SupportChatMessageType, null: true
    field :risk_detected, Boolean, null: false
    field :errors, [String], null: false

    def resolve(referral_id: nil, message_text:)
      require_parent!

      referral = referral_id ? current_user.referrals.find_by(id: referral_id) : nil
      if referral_id.present? && referral.nil?
        return { chat: nil, message: nil, ai_message: nil, risk_detected: false, errors: ["Referral not found"] }
      end

      chat = Chat::SupportChatService.find_or_create_chat(user: current_user, referral: referral)

      ai_client = Ai::OpenaiProvider.new
      result = Chat::SupportChatService.send_parent_message(
        chat: chat,
        message_text: message_text,
        ai_client: ai_client
      )

      {
        chat: chat.reload,
        message: result[:parent_message],
        ai_message: result[:ai_message],
        risk_detected: result[:risk_detected],
        errors: []
      }
    rescue StandardError => e
      { chat: nil, message: nil, ai_message: nil, risk_detected: false, errors: [e.message] }
    end
  end
end
