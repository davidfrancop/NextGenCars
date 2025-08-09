import { gql } from "@apollo/client"

export const UPDATE_CLIENT = gql`
  mutation UpdateClient(
    $client_id: Int!
    $first_name: String
    $last_name: String
    $email: String
    $phone: String
    $country: String
    $type: String
  ) {
    updateClient(
      client_id: $client_id
      first_name: $first_name
      last_name: $last_name
      email: $email
      phone: $phone
      country: $country
      type: $type
    ) {
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
