import { gql } from "@apollo/client";

export const WITHDRAW_REFERRAL_MUTATION = gql`
  mutation WithdrawReferral($referralId: ID!) {
    withdrawReferral(referralId: $referralId) {
      referral {
        id
        status
        withdrawnAt
      }
      errors
    }
  }
`;


