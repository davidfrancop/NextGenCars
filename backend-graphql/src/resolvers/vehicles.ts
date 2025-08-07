// backend-graphql/src/resolvers/vehicles.ts

import { db } from "../../db"

export const vehicleResolvers = {
  Query: {
    vehicles: async () => {
      console.log("🚗 Fetching all vehicles...")

      return await db.vehicles.findMany({
        include: {
          client: true,
        },
        orderBy: {
          created_at: "desc",
        },
      })
    },
  },

  Mutation: {
    createVehicle: async (
      _: unknown,
      args: {
        client_id: number
        make: string
        model: string
        year: number
        license_plate: string
        vin: string
        hsn: string
        tsn: string
        fuel_type: string
        drive: string
        transmission: string
        km: number
      }
    ) => {
      const {
        client_id,
        make,
        model,
        year,
        license_plate,
        vin,
        hsn,
        tsn,
        fuel_type,
        drive,
        transmission,
        km,
      } = args

      console.log("🆕 Creating vehicle for client:", client_id)

      const vehicle = await db.vehicles.create({
        data: {
          client_id,
          make,
          model,
          year,
          license_plate,
          vin,
          hsn,
          tsn,
          fuel_type,
          drive,
          transmission,
          km,
        },
        include: {
          client: true,
        },
      })

      console.log("✅ Vehicle created:", vehicle.vehicle_id)

      return vehicle
    },

    deleteVehicle: async (
      _: unknown,
      { vehicleId }: { vehicleId: number }
    ): Promise<boolean> => {
      console.log(`🗑️ Deleting vehicle with ID ${vehicleId}...`)
      try {
        await db.vehicles.delete({
          where: { vehicle_id: vehicleId },
        })
        console.log("✅ Vehicle deleted.")
        return true
      } catch (error) {
        console.error("❌ Failed to delete vehicle:", error)
        return false
      }
    },
  },
}
