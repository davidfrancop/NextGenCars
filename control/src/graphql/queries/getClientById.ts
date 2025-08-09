import { gql } from "@apollo/client"

export const GET_CLIENT_BY_ID = gql`
  query GetClient($client_id: Int!) {
    client(client_id: $client_id) {
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
