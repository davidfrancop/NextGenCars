// control/src/graphql/queries/getVehicleById.ts
import { gql } from "@apollo/client"

export const GET_VEHICLE_BY_ID = gql`
  query GetVehicleById($vehicle_id: Int!) {
    vehicle(vehicle_id: $vehicle_id) {
      vehicle_id
      make
      model
      year
      plate
      vin
    }
  }
`
