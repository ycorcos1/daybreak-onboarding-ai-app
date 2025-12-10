import { gql } from "@apollo/client";

export const START_SCREENER_SESSION = gql`
  mutation StartScreenerSession($referralId: ID!) {
    startScreenerSession(referralId: $referralId) {
      session {
        id
        referralId
        transcriptJsonb
        summaryJsonb
        riskFlag
        completedAt
      }
      errors
    }
  }
`;

export const APPEND_SCREENER_MESSAGE = gql`
  mutation AppendScreenerMessage($referralId: ID!, $parentMessage: String!) {
    appendScreenerMessage(referralId: $referralId, parentMessage: $parentMessage) {
      session {
        id
        referralId
        transcriptJsonb
        summaryJsonb
        riskFlag
        completedAt
      }
      aiReply
      crisisDetected
      errors
    }
  }
`;

export const COMPLETE_SCREENER = gql`
  mutation CompleteScreener($referralId: ID!) {
    completeScreener(referralId: $referralId) {
      session {
        id
        referralId
        transcriptJsonb
        summaryJsonb
        riskFlag
        completedAt
      }
      errors
    }
  }
`;


