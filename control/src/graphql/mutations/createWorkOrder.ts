// control/src/graphql/mutations/createWorkOrder.ts

import { gql } from "@apollo/client"

export const CREATE_WORK_ORDER = gql`
  mutation CreateWorkOrder($input: WorkOrderCreateInput!) {
    createWorkOrder(input: $input) {
      work_order_id
      client_id
      vehicle_id
      assigned_user_id
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
      }
      vehicle {
        vehicle_id
        license_plate
        make
        model
      }
      assigned_user {
        user_id
        username
        role
      }
    }
  }
`
