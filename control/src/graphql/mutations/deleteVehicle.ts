import { gql } from "@apollo/client"

export const DELETE_VEHICLE = gql`
  mutation DeleteVehicle($vehicleId: Int!) {
    deleteVehicle(vehicleId: $vehicleId)
  }
`
