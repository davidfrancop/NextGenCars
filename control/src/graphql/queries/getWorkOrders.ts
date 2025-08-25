// control/src/graphql/queries/getWorkOrders.ts

import { gql } from "@apollo/client"

export const GET_WORK_ORDERS = gql`
  query WorkOrders($filter: WorkOrderFilter, $skip: Int, $take: Int) {
    workOrders(filter: $filter, skip: $skip, take: $take) {
      total
      items {
        work_order_id
        title
        status
        priority
        created_at
        scheduled_start
        total_cost
        client { client_id type company_name first_name last_name }
        vehicle { vehicle_id license_plate make model }
        assigned_user { user_id username role }
      }
    }
  }
`
