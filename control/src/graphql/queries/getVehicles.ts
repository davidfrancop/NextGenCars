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
      vin
      client {
        client_id
        first_name
        last_name
      }
    }
  }
`
