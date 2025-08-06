// src/graphql/queries/getPersonalClients.ts
import { gql } from "@apollo/client"

export const GET_PERSONAL_CLIENTS = gql`
  query GetPersonalClients {
    personalClients {
      client_id
      first_name
      last_name
      email
      phone
      country
    }
  }
`
