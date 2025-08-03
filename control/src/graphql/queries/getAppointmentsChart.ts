import { gql } from "@apollo/client"

export const GET_APPOINTMENTS_CHART = gql`
  query GetAppointmentsThisWeek {
    appointmentsThisWeek {
      day
      count
    }
  }
`
