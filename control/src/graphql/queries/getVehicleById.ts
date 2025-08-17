// control/src/graphql/queries/getVehicleById.ts

import { gql } from "@apollo/client"

export const GET_VEHICLE_BY_ID = gql`
  query GetVehicleById($vehicle_id: Int!) {
    vehicle(vehicle_id: $vehicle_id) {
      vehicle_id
      client_id
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
      client {
        client_id
        first_name
        last_name
        company_name
        email
      }
    }
  }
`
