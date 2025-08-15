// src/graphql/queries/getUsers.ts

import { gql } from "@apollo/client"

export const GET_USERS = gql`
  query GetUsers {
    users {
      user_id
      username
      email
      role
      created_at
    }
  }
`

export const GET_USER = gql`
  query GetUser($userId: Int!) {
    user(userId: $userId) {
      user_id
      username
      email
      role
      created_at
    }
  }
`
