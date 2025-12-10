import { gql } from "@apollo/client";

export const ADMIN_UPDATE_REFERRAL_STATUS = gql`
  mutation AdminUpdateReferralStatus($referralId: ID!, $status: ReferralStatusEnum!) {
    updateReferralStatus(referralId: $referralId, status: $status) {
      referral {
        id
        status
        submittedAt
        withdrawnAt
        packetStatus
      }
      errors
    }
  }
`;

export const ADMIN_ADD_REFERRAL_NOTE = gql`
  mutation AdminAddReferralNote($referralId: ID!, $noteText: String!) {
    addReferralNote(referralId: $referralId, noteText: $noteText) {
      referralNote {
        id
        noteText
        createdAt
        adminUser {
          id
          name
          email
        }
      }
      errors
    }
  }
`;

export const ADMIN_RECORD_APPOINTMENT = gql`
  mutation RecordAppointmentDetails(
    $referralId: ID!
    $scheduledDate: ISO8601Date!
    $scheduledTime: String!
    $clinicianName: String!
    $sessionType: String!
  ) {
    recordAppointmentDetails(
      referralId: $referralId
      scheduledDate: $scheduledDate
      scheduledTime: $scheduledTime
      clinicianName: $clinicianName
      sessionType: $sessionType
    ) {
      referral {
        id
        scheduledDate
        scheduledTime
        clinicianName
        sessionType
      }
      errors
    }
  }
`;

export const ADMIN_APPROVE_DELETION = gql`
  mutation ApproveReferralDeletion($referralId: ID!) {
    approveReferralDeletion(referralId: $referralId) {
      success
      errors
    }
  }
`;

export const ADMIN_REJECT_DELETION = gql`
  mutation RejectReferralDeletion($referralId: ID!, $reason: String) {
    rejectReferralDeletion(referralId: $referralId, reason: $reason) {
      referral {
        id
        deletionRequestedAt
        status
      }
      errors
    }
  }
`;


