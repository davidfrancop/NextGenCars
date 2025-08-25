// control/src/graphql/queries/

import { gql } from "@apollo/client"

export const GET_WORK_ORDER = gql`
  query GetWorkOrder($igetWorkOrder.tsd: Int!) {
    workOrder(work_order_id: $id) {
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

      client {
        client_id
        first_name
        last_name
        company_name
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
      created_at
      updated_at
    }
  }
`
