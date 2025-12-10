import { gql } from "@apollo/client";

export const MY_SUPPORT_CHATS_QUERY = gql`
  query MySupportChats($referralId: ID) {
    mySupportChats(referralId: $referralId) {
      id
      referralId
      parentUserId
      mode
      createdAt
      updatedAt
      supportChatMessages {
        id
        senderType
        messageText
        metadataJsonb
        createdAt
      }
    }
  }
`;

export const ADMIN_CHATS_QUERY = gql`
  query AdminChats($limit: Int, $offset: Int) {
    adminChats(limit: $limit, offset: $offset) {
      id
      referralId
      parentUserId
      mode
      createdAt
      updatedAt
      supportChatMessages {
        id
        senderType
        messageText
        createdAt
      }
    }
  }
`;

export const ADMIN_CHAT_QUERY = gql`
  query AdminChat($id: ID!) {
    adminChat(id: $id) {
      id
      referralId
      parentUserId
      mode
      createdAt
      updatedAt
      supportChatMessages {
        id
        senderType
        messageText
        metadataJsonb
        createdAt
      }
    }
  }
`;

