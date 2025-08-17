// control/src/graphql/queries/getVehicles.ts

import { gql } from "@apollo/client"

export const GET_VEHICLES = gql`
  query GetVehicles {
    vehicles {
      vehicle_id
      make
      model
      year
      license_plate
      plate: license_plate
      vin
      created_at
      client {
        client_id
        type
        first_name
        last_name
        company_name
      }
    }
  }
`
