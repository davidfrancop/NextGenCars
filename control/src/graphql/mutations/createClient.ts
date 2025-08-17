// control/src/graphql/mutations/createClient.ts

import { gql } from "@apollo/client"

export const CREATE_CLIENT = gql`
  mutation CreateClient($data: CreateClientInput!) {
    createClient(data: $data) {
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

