// control/src/graphql/mutations/updateVehicle.ts
import { gql } from "@apollo/client"

export const UPDATE_VEHICLE = gql`
  mutation UpdateVehicle(
    $vehicle_id: Int!
    $make: String!
    $model: String!
    $year: Int!
    $plate: String!
    $vin: String!
  ) {
    updateVehicle(
      vehicle_id: $vehicle_id
      make: $make
      model: $model
      year: $year
      plate: $plate
      vin: $vin
    ) {
      vehicle_id
    }
  }
`
