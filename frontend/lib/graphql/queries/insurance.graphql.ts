import { gql } from "@apollo/client";

export const GET_INSURANCE_AND_COST = gql`
  query GetInsuranceAndCost($id: ID!) {
    referral(id: $id) {
      id
      insuranceDetail {
        id
        insuranceStatus
        insurerName
        planName
        memberId
        groupId
        policyholderName
        coveragePhone
        coverageWebsite
        source
      }
      insuranceUploads {
        id
        frontImageS3Key
        backImageS3Key
        ocrStatus
        ocrConfidence
        createdAt
        updatedAt
      }
      costEstimate {
        id
        category
        ruleKey
        explanationText
        updatedAt
      }
    }
  }
`;


