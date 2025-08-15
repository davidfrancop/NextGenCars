// src/graphql/mutations/updateUser.ts

import { gql } from "@apollo/client"

export const UPDATE_USER = gql`
  mutation UpdateUser(
    $userId: Int!
    $username: String!
    $email: String!
    $role: String!
    $password: String
  ) {
    updateUser(
      userId: $userId
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
