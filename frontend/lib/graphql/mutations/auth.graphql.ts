import { gql } from "@apollo/client";

export const SIGNUP_MUTATION = gql`
  mutation Signup($email: String!, $password: String!, $name: String!) {
    signupParent(email: $email, password: $password, name: $name) {
      user {
        id
        email
        name
        role
      }
      errors
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
        email
        name
        role
      }
      errors
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
    }
  }
`;

