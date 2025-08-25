// control/src/graphql/mutations/deleteWorkOrder.ts

import { gql } from "@apollo/client"

export const DELETE_WORK_ORDER = gql`
  mutation DeleteWorkOrder($id: Int!) {
    deleteWorkOrder(work_order_id: $id)
  }
`
