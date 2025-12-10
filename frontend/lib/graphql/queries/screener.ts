import { gql } from "@apollo/client";

export const GET_SCREENER_SESSION = gql`
  query ScreenerSession($referralId: ID!) {
    screenerSession(referralId: $referralId) {
      id
      referralId
      transcriptJsonb
      summaryJsonb
      riskFlag
      completedAt
    }
  }
`;


