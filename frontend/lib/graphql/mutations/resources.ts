import { gql } from "@apollo/client";

export const CREATE_RESOURCE_ITEM = gql`
  mutation CreateResourceItem($resourceInput: ResourceItemInput!) {
    createResourceItem(resourceInput: $resourceInput) {
      resourceItem {
        id
        title
        resourceType
        published
      }
      errors
    }
  }
`;

export const UPDATE_RESOURCE_ITEM = gql`
  mutation UpdateResourceItem($id: ID!, $resourceInput: ResourceItemInput!) {
    updateResourceItem(id: $id, resourceInput: $resourceInput) {
      resourceItem {
        id
        title
        resourceType
        published
      }
      errors
    }
  }
`;

export const DELETE_RESOURCE_ITEM = gql`
  mutation DeleteResourceItem($id: ID!) {
    deleteResourceItem(id: $id) {
      success
      errors
    }
  }
`;

