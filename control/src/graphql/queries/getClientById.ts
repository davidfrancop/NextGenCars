// control/src/graphql/queries/getClientById.ts
import { gql } from "@apollo/client"

export const GET_CLIENT_BY_ID = gql`
  query GetClient($client_id: Int!) {
    client(client_id: $client_id) {
      client_id
      type
      # PERSONAL
      first_name
      last_name
      # COMPANY
      company_name
      vat_number
      contact_person
      # Compartidos
      email
      phone
      dni
      address
      country
      city
      postal_code
      created_at
      updated_at
    }
  }
`
