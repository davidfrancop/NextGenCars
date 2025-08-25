// control/src/graphql/queries/getWorkOrdersRevenue.ts

import { gql } from "@apollo/client"

export const GET_WORK_ORDERS_REVENUE = gql`
  query WorkOrdersRevenue($from: DateTime, $to: DateTime) {
    workOrdersRevenue(from: $from, to: $to)
  }
`
