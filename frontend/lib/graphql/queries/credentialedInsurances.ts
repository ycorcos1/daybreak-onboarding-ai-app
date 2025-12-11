import { gql } from "@apollo/client";

export const CREDENTIALED_INSURANCES_QUERY = gql`
  query CredentialedInsurances {
    credentialedInsurances {
      id
      name
      state
      lineOfBusiness
      networkStatus
    }
  }
`;

export type CredentialedInsurancesResult = {
  credentialedInsurances: Array<{
    id: string;
    name: string;
    state?: string | null;
    lineOfBusiness?: string | null;
    networkStatus?: string | null;
  }>;
};


