import { gql } from "@apollo/client";

export const SEND_SUPPORT_MESSAGE_MUTATION = gql`
  mutation SendSupportMessage($referralId: ID, $messageText: String!) {
    sendSupportMessage(referralId: $referralId, messageText: $messageText) {
      chat {
        id
        mode
        updatedAt
      }
      message {
        id
        senderType
        messageText
        createdAt
      }
      aiMessage {
        id
        senderType
        messageText
        createdAt
      }
      riskDetected
      errors
    }
  }
`;

export const SEND_ADMIN_CHAT_MESSAGE_MUTATION = gql`
  mutation SendAdminChatMessage($chatId: ID!, $messageText: String!) {
    sendAdminChatMessage(chatId: $chatId, messageText: $messageText) {
      message {
        id
        senderType
        messageText
        createdAt
      }
      chat {
        id
        mode
        updatedAt
      }
      errors
    }
  }
`;

