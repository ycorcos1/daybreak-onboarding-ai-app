module Chat
  # Service to manage support chat lifecycle and threading rules.
  class SupportChatService
    class ChatNotFoundError < StandardError; end

    # Finds or creates a chat thread for the given user/referral.
    # Rules:
    # - One chat per referral (referral_id present).
    # - One general chat per user when no referral exists (referral_id nil).
    def self.find_or_create_chat(user:, referral: nil, mode: "ai")
      if referral
        return user.support_chats.find_or_create_by(referral_id: referral.id) do |chat|
          chat.mode = mode
        end
      end

      user.support_chats.find_or_create_by(referral_id: nil) do |chat|
        chat.mode = mode
      end
    end

    # Sends a message and optionally generates an AI response.
    # Returns a hash with :parent_message, :ai_message, :risk_detected.
    def self.send_parent_message(chat:, message_text:, ai_client:)
      parent_message = chat.support_chat_messages.create!(
        sender_type: "parent",
        message_text: message_text,
        metadata_jsonb: {}
      )

      safety_result = Ai::SafetyGuard.evaluate(message_text)

      if safety_result[:risk_level] == :crisis
        emergency_text = Ai::SafetyGuard.emergency_message
        ai_message = chat.support_chat_messages.create!(
          sender_type: "ai",
          message_text: emergency_text,
          metadata_jsonb: { risk_detected: true, risk_reasons: safety_result[:reasons] }
        )

        chat.referral&.update!(risk_flag: true)
        chat.touch

        return { parent_message: parent_message, ai_message: ai_message, risk_detected: true }
      end

      ai_message = nil
      if ai_client && (chat.mode.nil? || chat.mode == "ai")
        history = build_history(chat)
        ai_reply_text = ai_client.generate_support_reply(
          conversation_history: history,
          parent_message: message_text
        )

        ai_message = chat.support_chat_messages.create!(
          sender_type: "ai",
          message_text: ai_reply_text,
          metadata_jsonb: {}
        )
      end

      chat.touch
      { parent_message: parent_message, ai_message: ai_message, risk_detected: false }
    end

    # Sends an admin reply and updates chat mode to mixed.
    def self.send_admin_message(chat_id:, admin_user:, message_text:)
      chat = SupportChat.find_by(id: chat_id)
      raise ChatNotFoundError, "Chat not found" unless chat

      message = chat.support_chat_messages.create!(
        sender_type: "admin",
        message_text: message_text,
        metadata_jsonb: { admin_user_id: admin_user.id, admin_name: admin_user.name }
      )

      if chat.mode.nil? || chat.mode == "ai"
        chat.update!(mode: "mixed")
      else
        chat.touch
      end

      if chat.referral.present?
        Notifications::Dispatcher.admin_message_sent(
          referral: chat.referral,
          user: chat.parent_user,
          message_preview: message_text.truncate(60)
        )
      end

      message
    end

    def self.build_history(chat)
      chat.support_chat_messages.order(:created_at).map do |msg|
        {
          role: msg.sender_type == "parent" ? "user" : "assistant",
          content: msg.message_text
        }
      end
    end
  end
end

