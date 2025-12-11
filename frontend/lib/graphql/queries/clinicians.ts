import { gql } from "@apollo/client";

export const CLINICIANS_QUERY = gql`
  query Clinicians($filter: ClinicianFilterInput, $limit: Int, $offset: Int) {
    clinicians(filter: $filter, limit: $limit, offset: $offset) {
      id
      firstName
      lastName
      email
      phone
      licenseState
      credentials
      active
      specialties
      profileData
      credentialedInsurances {
        id
        name
        state
        networkStatus
        lineOfBusiness
      }
      availabilities {
        id
        dayOfWeek
        startTime
        endTime
        timezone
      }
    }
  }
`;

export type CliniciansQueryResult = {
  clinicians: Array<{
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    licenseState?: string | null;
    credentials?: string | null;
    active?: boolean | null;
    specialties?: any;
    profileData?: any;
    credentialedInsurances: Array<{
      id: string;
      name: string;
      state?: string | null;
      networkStatus?: string | null;
      lineOfBusiness?: string | null;
    }>;
    availabilities: Array<{
      id: string;
      dayOfWeek?: number | null;
      startTime?: string | null;
      endTime?: string | null;
      timezone?: string | null;
    }>;
  }>;
};


