// control/src/graphql/queries/getWorkOrder.ts

import { gql } from "@apollo/client"

export const GET_WORK_ORDER = gql`
  query GetWorkOrder($work_order_id: Int!) {
    workOrder(work_order_id: $work_order_id) {
      work_order_id
      title
      description
      status
      priority
      scheduled_start
      scheduled_end
      start_date
      end_date
      km_at_service
      estimated_cost
      total_cost
      tasks
      created_at
      updated_at
      client {
        client_id
        type
        company_name
        first_name
        last_name
        email
      }
      vehicle {
        vehicle_id
        make
        model
        license_plate
      }
      assigned_user {
        user_id
        username
        role
      }
    }
  }
`
