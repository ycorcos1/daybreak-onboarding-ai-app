import { gql } from "@apollo/client";

export const CREATE_CHILD_AND_REFERRAL = gql`
  mutation CreateChildAndReferral($childInput: ChildInput!) {
    createChildAndReferral(childInput: $childInput) {
      child {
        id
        name
        grade
        schoolName
        district
      }
      referral {
        id
        status
        lastCompletedStep
        nextStep
      }
      errors
    }
  }
`;

export const UPDATE_REFERRAL_STEP = gql`
  mutation UpdateReferralStep(
    $referralId: ID!
    $stepName: String!
    $stepData: JSON
  ) {
    updateReferralStep(
      referralId: $referralId
      stepName: $stepName
      stepData: $stepData
    ) {
      referral {
        id
        status
        lastCompletedStep
        lastUpdatedStepAt
        nextStep
      }
      errors
    }
  }
`;

export const UPDATE_PARENT_INFO = gql`
  mutation UpdateParentInfo($referralId: ID!, $parentInfo: ParentInfoInput!) {
    updateParentInfo(referralId: $referralId, parentInfo: $parentInfo) {
      user {
        id
        name
        email
        phone
        address
        languagePreference
        relationshipToChild
      }
      referral {
        id
        lastCompletedStep
        lastUpdatedStepAt
      }
      errors
    }
  }
`;

export const UPDATE_CHILD_INFO = gql`
  mutation UpdateChildInfo($referralId: ID!, $childInput: ChildInput!) {
    updateChildInfo(referralId: $referralId, childInput: $childInput) {
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
      referral {
        id
        lastCompletedStep
        lastUpdatedStepAt
      }
      errors
    }
  }
`;

export const UPDATE_CLINICAL_INTAKE = gql`
  mutation UpdateClinicalIntake($referralId: ID!, $intakeInput: ClinicalIntakeInput!) {
    updateClinicalIntake(referralId: $referralId, intakeInput: $intakeInput) {
      intakeResponse {
        id
        responses
      }
      referral {
        id
        lastCompletedStep
        lastUpdatedStepAt
      }
      errors
    }
  }
`;

export const UPDATE_SCHEDULING_PREFERENCES = gql`
  mutation UpdateSchedulingPreferences(
    $referralId: ID!
    $schedulingInput: SchedulingPreferenceInput!
  ) {
    updateSchedulingPreferences(referralId: $referralId, schedulingInput: $schedulingInput) {
      schedulingPreference {
        id
        timezone
        locationPreference
        frequency
        clinicianPreferences
        windows
        suggestedWindows
      }
      referral {
        id
        lastCompletedStep
        lastUpdatedStepAt
      }
      errors
    }
  }
`;

export const SUBMIT_REFERRAL = gql`
  mutation SubmitReferral($referralId: ID!) {
    submitReferral(referralId: $referralId) {
      referral {
        id
        status
        packetStatus
        submittedAt
      }
      errors
    }
  }
`;

export const UPDATE_INSURANCE_DETAILS = gql`
  mutation UpdateInsuranceDetails($referralId: ID!, $insuranceInput: InsuranceDetailInput!) {
    updateInsuranceDetails(referralId: $referralId, insuranceInput: $insuranceInput) {
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
      referral {
        id
        lastCompletedStep
        lastUpdatedStepAt
      }
      errors
    }
  }
`;

export const ACCEPT_CONSENTS = gql`
  mutation AcceptConsents($referralId: ID!, $consents: [ConsentInput!]!) {
    acceptConsents(referralId: $referralId, consents: $consents) {
      consentRecords {
        id
        consentType
        acceptedAt
        ipAddress
        userAgent
      }
      referral {
        id
        lastCompletedStep
        lastUpdatedStepAt
      }
      errors
    }
  }
`;

