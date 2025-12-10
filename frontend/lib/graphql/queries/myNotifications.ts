import { gql } from "@apollo/client";

export const MY_NOTIFICATIONS_QUERY = gql`
  query MyNotifications($unreadOnly: Boolean) {
    myNotifications(unreadOnly: $unreadOnly) {
      id
      userId
      referralId
      notificationType
      payloadJsonb
      readAt
      createdAt
    }
  }
`;


