import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      role
    }
  }
`;

export type MeQueryResult = {
  me: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
};

