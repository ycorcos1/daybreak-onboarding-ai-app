import { gql } from "@apollo/client";

export const MY_REFERRALS_QUERY = gql`
  query MyReferrals {
    myReferrals {
      id
      status
      packetStatus
      riskFlag
      lastCompletedStep
      lastUpdatedStepAt
      nextStep
      createdAt
      submittedAt
      withdrawnAt
      deletionRequestedAt
      child {
        id
        name
        grade
        schoolName
        district
      }
    }
  }
`;

export const REFERRAL_QUERY = gql`
  query Referral($id: ID!) {
    referral(id: $id) {
      id
      status
      packetStatus
      deletionRequestedAt
      withdrawnAt
      createdAt
      riskFlag
      lastCompletedStep
      lastUpdatedStepAt
      nextStep
      submittedAt
      user {
        id
        name
        email
        phone
        address
        languagePreference
        relationshipToChild
      }
      child {
        id
        name
        dob
        ageBand
        grade
        schoolName
        district
        state
        primaryLanguage
        pronouns
      }
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
      intakeResponse {
        id
        responses
      }
      consentRecords {
        id
        consentType
        acceptedAt
        ipAddress
        userAgent
      }
      schedulingPreference {
        id
        timezone
        locationPreference
        frequency
        clinicianPreferences
        windows
        suggestedWindows
      }
      aiScreenerSession {
        id
        summaryJsonb
        riskFlag
      }
    }
  }
`;

export const REFERRAL_STATUS_QUERY = gql`
  query ReferralStatus($id: ID!) {
    referral(id: $id) {
      id
      status
      packetStatus
    }
  }
`;


