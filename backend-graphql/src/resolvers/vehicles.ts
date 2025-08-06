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
        plate: string
        vin: string
      }
    ) => {
      const { client_id, make, model, year, plate, vin } = args

      console.log("🆕 Creating vehicle for client:", client_id)

      const vehicle = await db.vehicles.create({
        data: {
          client_id,
          make,
          model,
          year,
          plate,
          vin,
        },
        include: {
          client: true,
        },
      })

      console.log("✅ Vehicle created:", vehicle.vehicle_id)

      return vehicle
    },
  },
}
