import { gql } from "@apollo/client";

export const ADMIN_CLINICIANS_QUERY = gql`
  query AdminClinicians($limit: Int, $offset: Int) {
    adminClinicians(limit: $limit, offset: $offset) {
      id
      firstName
      lastName
      email
      licenseNumber
      licenseState
      credentials
      active
      credentialedInsurances {
        id
        name
        state
        networkStatus
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

export const ADMIN_CLINICIAN_QUERY = gql`
  query AdminClinician($id: ID!) {
    adminClinician(id: $id) {
      id
      firstName
      lastName
      email
      phone
      licenseNumber
      licenseState
      credentials
      active
      profileData
      specialties
      credentialedInsurances {
        id
        name
        state
        networkStatus
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

export type AdminClinician = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  licenseNumber?: string | null;
  licenseState?: string | null;
  credentials?: string | null;
  active?: boolean | null;
  profileData?: Record<string, unknown> | null;
  specialties?: string[] | null;
  credentialedInsurances: Array<{
    id: string;
    name: string;
    state?: string | null;
    networkStatus?: string | null;
  }>;
  availabilities: Array<{
    id: string;
    dayOfWeek?: number | null;
    startTime?: string | null;
    endTime?: string | null;
    timezone?: string | null;
  }>;
};

export type AdminCliniciansResult = {
  adminClinicians: AdminClinician[];
};

export type AdminClinicianResult = {
  adminClinician: AdminClinician | null;
};

