// src/graphql/queries/getClients.ts
import { gql } from "@apollo/client"

export const GET_CLIENTS = gql`
  query GetClients {
    clients {
      client_id
      first_name
      last_name
      email
      phone
      country
      type
    }
  }
`
