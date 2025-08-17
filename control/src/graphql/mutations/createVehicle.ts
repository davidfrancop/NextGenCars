// control/src/graphql/mutations/createVehicle.ts
import { gql } from "@apollo/client"

export const CREATE_VEHICLE = gql`
  mutation CreateVehicle(
    $client_id: Int!
    $make: String!
    $model: String!
    $year: Int!
    $plate: String!          # puedes mantener este nombre en tu UI
    $vin: String!
    $hsn: String!
    $tsn: String!
    $fuel_type: String!
    $drive: String!
    $transmission: String!
    $km: Int!
  ) {
    createVehicle(
      client_id: $client_id
      make: $make
      model: $model
      year: $year
      license_plate: $plate   # ← el argumento correcto en el schema
      vin: $vin
      hsn: $hsn
      tsn: $tsn
      fuel_type: $fuel_type
      drive: $drive
      transmission: $transmission
      km: $km
    ) {
      vehicle_id
      client_id
      make
      model
      year
      license_plate
      vin
    }
  }
`
