import { gql } from "@apollo/client";

export const ADMIN_ORGANIZATIONS_QUERY = gql`
  query AdminOrganizations($limit: Int) {
    adminOrganizations(limit: $limit) {
      id
      name
      kind
      slug
      tzdb
      parentOrganization {
        id
        name
      }
      contracts {
        id
        services
        effectiveDate
        endDate
      }
    }
  }
`;

export type AdminOrganizationsResult = {
  adminOrganizations: Array<{
    id: string;
    name?: string | null;
    kind?: number | null;
    slug?: string | null;
    tzdb?: string | null;
    parentOrganization?: { id: string; name?: string | null } | null;
    contracts: Array<{
      id: string;
      services?: Record<string, unknown> | string[] | null;
      effectiveDate?: string | null;
      endDate?: string | null;
    }>;
  }>;
};

