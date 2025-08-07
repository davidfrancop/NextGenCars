// control/src/graphql/mutations/createClient.ts
import { gql } from "@apollo/client"

export const CREATE_CLIENT = gql`
  mutation CreateClient(
    $first_name: String!
    $last_name: String!
    $email: String
    $phone: String
    $country: String
    $type: String!
  ) {
    createClient(
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
    }
  }
`
