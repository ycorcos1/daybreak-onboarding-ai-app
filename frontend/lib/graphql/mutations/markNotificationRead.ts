import { gql } from "@apollo/client";

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($notificationId: ID!) {
    markNotificationRead(notificationId: $notificationId) {
      notification {
        id
        readAt
      }
      errors
    }
  }
`;


