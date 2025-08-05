// src/graphql/mutations/deleteUser.ts
import { gql } from "@apollo/client"

export const DELETE_USER = gql`
  mutation DeleteUser($userId: Int!) {
    deleteUser(userId: $userId) {
      user_id
    }
  }
`
