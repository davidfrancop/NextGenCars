// control/src/graphql/mutations/updateVehicle.ts

import { gql } from "@apollo/client"

export const UPDATE_VEHICLE = gql`
  mutation UpdateVehicle(
    $vehicle_id: Int!
    $client_id: Int
    $make: String
    $model: String
    $year: Int
    $license_plate: String
    $vin: String
    $hsn: String
    $tsn: String
    $fuel_type: String
    $drive: String
    $transmission: String
    $km: Int
    $tuv_date: Date
    $last_service_date: Date
  ) {
    updateVehicle(
      vehicle_id: $vehicle_id
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
      updated_at
      client {
        client_id
        first_name
        last_name
        company_name
      }
    }
  }
`