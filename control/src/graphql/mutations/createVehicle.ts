// control/src/graphql/mutations/createVehicle.ts
import { gql } from "@apollo/client"

export const CREATE_VEHICLE = gql`
  mutation CreateVehicle(
    $client_id: Int!
    $make: String!
    $model: String!
    $year: Int!
    $license_plate: String!
    $vin: String!
    $hsn: String!
    $tsn: String!
    $fuel_type: String!
    $drive: String!
    $transmission: String!
    $km: Int!
    $tuv_date: Date
    $last_service_date: Date
  ) {
    createVehicle(
      client_id: $client_id
      make: $make
      model: $model
      year: $year
      license_plate: $license_plate
      vin: $vin
      hsn: $hsn
      tsn: $tsn
      fuel_type: $fuel_type
      drive: $drive
      transmission: $transmission
      km: $km
      tuv_date: $tuv_date
      last_service_date: $last_service_date
    ) {
      vehicle_id
      make
      model
      year
      license_plate
      vin
      hsn
      tsn
      fuel_type
      drive
      transmission
      km
      tuv_date
      last_service_date
      created_at
      updated_at
    }
  }
`