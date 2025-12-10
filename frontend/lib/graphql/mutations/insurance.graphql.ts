import { gql } from "@apollo/client";

export const START_INSURANCE_UPLOAD = gql`
  mutation StartInsuranceUpload(
    $referralId: ID!
    $frontImageS3Key: String
    $backImageS3Key: String
  ) {
    startInsuranceUpload(
      referralId: $referralId
      frontImageS3Key: $frontImageS3Key
      backImageS3Key: $backImageS3Key
    ) {
      insuranceUpload {
        id
        frontImageS3Key
        backImageS3Key
        ocrStatus
        ocrConfidence
        updatedAt
      }
      errors
    }
  }
`;

export const TRIGGER_INSURANCE_OCR = gql`
  mutation TriggerInsuranceOcr($referralId: ID!) {
    triggerInsuranceOcr(referralId: $referralId) {
      insuranceUpload {
        id
        ocrStatus
        ocrConfidence
        updatedAt
      }
      errors
    }
  }
`;

export const RECALCULATE_COST_ESTIMATE = gql`
  mutation RecalculateCostEstimate($referralId: ID!) {
    recalculateCostEstimate(referralId: $referralId) {
      costEstimate {
        id
        category
        ruleKey
        explanationText
        updatedAt
      }
      errors
    }
  }
`;


