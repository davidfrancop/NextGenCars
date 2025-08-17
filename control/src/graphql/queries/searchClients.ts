//control/src/graphql/queries/searchClients.ts

import { gql } from "@apollo/client"

export const SEARCH_CLIENTS = gql`
  query SearchClients($type: ClientType, $search: String, $take: Int, $skip: Int) {
    clients(type: $type, search: $search, take: $take, skip: $skip) {
      client_id
      type
      first_name
      last_name
      company_name
      email
    }
  }
`
