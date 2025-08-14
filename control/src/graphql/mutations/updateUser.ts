// src/graphql/mutations/updateUser.ts

import { gql } from "@apollo/client"

export const UPDATE_USER = gql`
  mutation UpdateUser(
    $user_id: Int!
    $username: String!
    $email: String!
    $role: String!
    $password: String
  ) {
    updateUser(
      user_id: $user_id
      username: $username
      email: $email
      role: $role
      password: $password
    ) {
      user_id
      username
      email
      role
    }
  }
`
