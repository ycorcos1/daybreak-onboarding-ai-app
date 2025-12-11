import { gql } from "@apollo/client";

export const ADMIN_CREDENTIALED_INSURANCES_QUERY = gql`
  query AdminCredentialedInsurances {
    adminCredentialedInsurances {
      id
      name
      state
      lineOfBusiness
      networkStatus
    }
  }
`;

export const ADMIN_INSURANCE_COVERAGES_QUERY = gql`
  query AdminInsuranceCoverages {
    adminInsuranceCoverages {
      id
      userId
      insuranceCompanyName
      policyHolderName
      planName
      memberId
      groupNumber
      eligibilityVerified
      inNetwork
      outOfNetwork
      credentialedInsurance {
        id
        name
        state
        networkStatus
      }
      user {
        id
        name
        email
      }
    }
  }
`;

export type AdminCredentialedInsurancesResult = {
  adminCredentialedInsurances: Array<{
    id: string;
    name: string;
    state?: string | null;
    lineOfBusiness?: string | null;
    networkStatus?: string | null;
  }>;
};

export type AdminInsuranceCoveragesResult = {
  adminInsuranceCoverages: Array<{
    id: string;
    userId: string;
    insuranceCompanyName?: string | null;
    policyHolderName?: string | null;
    planName?: string | null;
    memberId?: string | null;
    groupNumber?: string | null;
    eligibilityVerified?: boolean | null;
    inNetwork?: boolean | null;
    outOfNetwork?: boolean | null;
    credentialedInsurance?: {
      id: string;
      name: string;
      state?: string | null;
      networkStatus?: string | null;
    } | null;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  }>;
};

