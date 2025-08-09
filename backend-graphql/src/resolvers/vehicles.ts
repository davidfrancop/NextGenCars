import { Context } from "../context";

export const vehicleResolvers = {
  Query: {
    vehicles: async (_: unknown, __: unknown, { db }: Context) => {
      return db.vehicles.findMany({
        include: { client: true },
        orderBy: { created_at: "desc" },
      });
    },
  },
  Mutation: {
    createVehicle: async (_: unknown, args: {
      client_id: number; make: string; model: string; year: number;
      license_plate: string; vin: string; hsn?: string; tsn?: string;
      fuel_type?: string; drive?: string; transmission?: string; km?: number;
    }, { db }: Context) => {
      return db.vehicles.create({ data: { ...args } });
    },
    deleteVehicle: async (_: unknown, { vehicleId }: { vehicleId: number }, { db }: Context) => {
      await db.vehicles.delete({ where: { vehicle_id: vehicleId } });
      return true;
    },
  },
};
