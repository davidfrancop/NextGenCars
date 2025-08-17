// control/src/graphql/mutations/updateClient.ts

import { gql } from "@apollo/client"

export const UPDATE_CLIENT = gql`
  mutation UpdateClient($client_id: Int!, $data: UpdateClientInput!) {
    updateClient(client_id: $client_id, data: $data) {
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
