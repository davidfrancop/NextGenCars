// control/src/graphql/mutations/updateWorkOrder.ts

import { gql } from "@apollo/client"

export const UPDATE_WORK_ORDER = gql`
  mutation UpdateWorkOrder($id: Int!, $input: WorkOrderUpdateInput!) {
    updateWorkOrder(work_order_id: $id, input: $input) {
      work_order_id
      title
      status
      priority
      start_date
      end_date
      total_cost
      tasks
      updated_at
    }
  }
`
