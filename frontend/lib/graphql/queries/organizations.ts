import { gql } from "@apollo/client";

export const ORGANIZATIONS_QUERY = gql`
  query Organizations($limit: Int) {
    organizations(limit: $limit) {
      id
      name
      slug
      kind
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

export type OrganizationsQueryResult = {
  organizations: Array<{
    id: string;
    name?: string | null;
    slug?: string | null;
    kind?: number | null;
    tzdb?: string | null;
    parentOrganization?: { id: string; name?: string | null } | null;
    contracts: Array<{
      id: string;
      services: any;
      effectiveDate?: string | null;
      endDate?: string | null;
    }>;
  }>;
};


