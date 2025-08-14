// src/graphql/queries/getUser.ts
import { gql } from "@apollo/client"

export const GET_USER = gql`
  query GetUser($user_id: Int!) {
    user(user_id: $user_id) {
      user_id
      username
      email
      role
      created_at
    }
  }
`
