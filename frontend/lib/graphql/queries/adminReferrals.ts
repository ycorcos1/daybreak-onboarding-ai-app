import { gql } from "@apollo/client";

export const ADMIN_REFERRALS_QUERY = gql`
  query AdminReferrals($filter: ReferralFilterInput, $limit: Int, $offset: Int) {
    adminReferrals(filter: $filter, limit: $limit, offset: $offset) {
      id
      status
      riskFlag
      packetStatus
      createdAt
      submittedAt
      deletionRequestedAt
      child {
        id
        name
        grade
        schoolName
        district
      }
      user {
        id
        name
        email
      }
    }
  }
`;

export const ADMIN_REFERRAL_QUERY = gql`
  query AdminReferral($id: ID!) {
    adminReferral(id: $id) {
      id
      status
      packetStatus
      riskFlag
      deletionRequestedAt
      submittedAt
      withdrawnAt
      createdAt
      lastUpdatedStepAt
      scheduledDate
      scheduledTime
      clinicianName
      sessionType
      user {
        id
        name
        email
        phone
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
      intakeResponse {
        id
        responses
      }
      aiScreenerSession {
        id
        summaryJsonb
        riskFlag
        transcriptJsonb
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
      }
      costEstimate {
        id
        category
        ruleKey
        explanationText
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
      consentRecords {
        id
        consentType
        acceptedAt
        ipAddress
        userAgent
      }
      referralPacket {
        id
        packetJsonb
        pdfUrl
        pdfS3Key
      }
      referralNotes {
        id
        noteText
        createdAt
        adminUser {
          id
          name
          email
        }
      }
    }
  }
`;


