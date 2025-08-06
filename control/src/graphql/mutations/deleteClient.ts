// src/graphql/mutations/deleteClient.ts
import { gql } from "@apollo/client"

export const DELETE_CLIENT = gql`
  mutation DeleteClient($clientId: Int!) {
    deleteClient(clientId: $clientId)
  }
`
