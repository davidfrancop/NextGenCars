// control/src/graphql/queries/getRecentOrders.ts
import { gql } from "@apollo/client"

export const GET_RECENT_ORDERS = gql`
  query GetRecentOrders {
    recentWorkOrders {
      id
      clientName
      vehicleName
      vehiclePlate
      createdAt
      status
    }
  }
`
