import { gql } from "@apollo/client";

export const RESOURCES_QUERY = gql`
  query Resources($tags: [String!]) {
    resources(tags: $tags) {
      id
      title
      body
      url
      resourceType
      tags
      createdAt
    }
  }
`;

export const ADMIN_RESOURCES_QUERY = gql`
  query AdminResources {
    adminResources {
      id
      title
      body
      url
      resourceType
      tags
      published
      createdByAdminId
      createdAt
      updatedAt
    }
  }
`;

export const ADMIN_RESOURCE_QUERY = gql`
  query AdminResource($id: ID!) {
    adminResource(id: $id) {
      id
      title
      body
      url
      resourceType
      tags
      published
      createdAt
      updatedAt
    }
  }
`;


