// control/src/graphql/mutations/createVehicle.ts
import { gql } from "@apollo/client"

export const CREATE_VEHICLE = gql`
  mutation CreateVehicle(
    $client_id: Int!
    $make: String!
    $model: String!
    $year: Int!
    $plate: String!
    $vin: String!
  ) {
    createVehicle(
      client_id: $client_id
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
