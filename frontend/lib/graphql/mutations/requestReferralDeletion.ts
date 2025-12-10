import { gql } from "@apollo/client";

export const REQUEST_REFERRAL_DELETION_MUTATION = gql`
  mutation RequestReferralDeletion($referralId: ID!) {
    requestReferralDeletion(referralId: $referralId) {
      referral {
        id
        deletionRequestedAt
      }
      errors
    }
  }
`;


