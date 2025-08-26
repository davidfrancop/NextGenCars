// backend-graphql/src/resolvers/vehicles.ts

import type { Context } from "../context"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

/* =========================
   Validation utilities
   ========================= */
const normalizePlate = (raw?: string | null) =>
  (raw ?? "").toUpperCase().replace(/\s+/g, " ").trim()

const isPlateFormatValid = (plate: string) =>
  /^[A-Z0-9\- ]{4,12}$/.test(plate) // letters/numbers + space/hyphen (4–12)

const normalizeVIN = (raw?: string | null) => (raw ?? "").toUpperCase().trim()

// 17 is typical; allow 11–20 for flexibility
const isVINLengthValid = (vin: string) => vin.length >= 11 && vin.length <= 20

const isHSNValid = (hsn?: string | null) => !!hsn && /^[A-Z0-9]{4}$/.test(hsn.toUpperCase())
const isTSNValid = (tsn?: string | null) => !!tsn && /^[A-Z0-9]{3}$/.test(tsn.toUpperCase())

const isYearValid = (year?: number | null) =>
  typeof year === "number" && year >= 1950 && year <= 2100

const isKmValid = (km?: number | null) =>
  typeof km === "number" && km >= 0 && km <= 2_000_000

/** Accepts Date | "YYYY-MM-DD" | ISO | epoch(ms string/number) → Date | undefined */
const toDateOrUndefined = (raw?: Date | string | number | null): Date | undefined => {
  if (raw == null || raw === "") return undefined
  if (raw instanceof Date) return isNaN(raw.getTime()) ? undefined : raw
  if (typeof raw === "number") {
    const d = new Date(raw)
    return isNaN(d.getTime()) ? undefined : d
  }
  if (typeof raw === "string") {
    if (/^\d+$/.test(raw)) {
      const d = new Date(Number(raw))
      return isNaN(d.getTime()) ? undefined : d
    }
    // "YYYY-MM-DD" → midnight UTC of that day
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const d = new Date(`${raw}T00:00:00Z`)
      return isNaN(d.getTime()) ? undefined : d
    }
    // ISO or other parseable formats
    const d = new Date(raw)
    return isNaN(d.getTime()) ? undefined : d
  }
  return undefined
}

export const vehicleResolvers = {
  /* Field resolvers: only relations; scalars serialize dates */
  Vehicle: {
    client: async (parent: { client_id: number }, _args: unknown, { db }: Context) => {
      return db.clients.findUnique({ where: { client_id: parent.client_id } })
    },
  },

  Query: {
    vehicles: async (_: unknown, __: unknown, { db }: Context) => {
      return db.vehicles.findMany({
        include: { client: true },
        orderBy: { created_at: "desc" },
      })
    },

    vehicle: async (_: unknown, { vehicle_id }: { vehicle_id: number }, { db }: Context) => {
      return db.vehicles.findUnique({
        where: { vehicle_id },
        include: { client: true },
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
        tuv_date?: Date | string | number | null
        last_service_date?: Date | string | number | null
      },
      { db }: Context
    ) => {
      // Normalize
      const license_plate = normalizePlate(args.license_plate)
      const vin = normalizeVIN(args.vin)
      const hsn = args.hsn.toUpperCase()
      const tsn = args.tsn.toUpperCase()

      // Validate
      if (!isPlateFormatValid(license_plate)) {
        throw new Error("Invalid license plate format. Use 4–12 alphanumerics with spaces or hyphens.")
      }
      if (!isVINLengthValid(vin)) {
        throw new Error("Invalid VIN. Must be between 11 and 20 characters (17 typical).")
      }
      if (!isHSNValid(hsn)) {
        throw new Error("Invalid HSN. Must be exactly 4 alphanumeric characters.")
      }
      if (!isTSNValid(tsn)) {
        throw new Error("Invalid TSN. Must be exactly 3 alphanumeric characters.")
      }
      if (!isYearValid(args.year)) {
        throw new Error("Invalid year. Must be between 1950 and 2100.")
      }
      if (!isKmValid(args.km)) {
        throw new Error("Invalid mileage. Must be a non-negative integer ≤ 2,000,000.")
      }

      // FK exists
      const clientExists = await db.clients.findUnique({ where: { client_id: args.client_id } })
      if (!clientExists) throw new Error("Client not found.")

      // Uniqueness
      const [plateExists, vinExists] = await Promise.all([
        db.vehicles.findUnique({ where: { license_plate } }),
        db.vehicles.findUnique({ where: { vin } }),
      ])
      if (plateExists) throw new Error("License plate already exists.")
      if (vinExists) throw new Error("VIN already exists.")

      try {
        return await db.vehicles.create({
          data: {
            client_id: args.client_id,
            make: args.make.trim(),
            model: args.model.trim(),
            year: args.year,
            license_plate,
            vin,
            hsn,
            tsn,
            fuel_type: args.fuel_type,
            drive: args.drive,
            transmission: args.transmission,
            km: args.km,
            // Date-only fields (GraphQL Date): accept Date | "YYYY-MM-DD" | ISO | epoch
            tuv_date: toDateOrUndefined(args.tuv_date),
            last_service_date: toDateOrUndefined(args.last_service_date),
          },
        })
      } catch (err: unknown) {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === "P2002") {
            const target = (err.meta?.target as string[])?.join(", ") || "unique field"
            if (target.includes("vin")) throw new Error("VIN already exists.")
            if (target.includes("license_plate"))
              throw new Error("License plate already exists.")
            throw new Error(`Uniqueness conflict on ${target}.`)
          }
        }
        throw err
      }
    },

    updateVehicle: async (
      _: unknown,
      args: {
        vehicle_id: number
        client_id?: number           // 👈 allow reassignment
        make?: string
        model?: string
        year?: number
        // Accept 'plate' alias from the frontend; DB uses 'license_plate'
        plate?: string
        license_plate?: string
        vin?: string
        hsn?: string
        tsn?: string
        fuel_type?: string
        drive?: string
        transmission?: string
        km?: number
        tuv_date?: Date | string | number | null
        last_service_date?: Date | string | number | null
      },
      { db }: Context
    ) => {
      const { vehicle_id, ...rest } = args

      // Optional: verify target client exists if provided
      if (typeof rest.client_id === "number") {
        const client = await db.clients.findUnique({ where: { client_id: rest.client_id } })
        if (!client) throw new Error("Client not found.")
      }

      // License plate (supports 'plate' or 'license_plate')
      const incomingPlate = rest.plate ?? rest.license_plate
      let license_plate: string | undefined
      if (typeof incomingPlate === "string") {
        license_plate = normalizePlate(incomingPlate)
        if (!isPlateFormatValid(license_plate)) {
          throw new Error("Invalid license plate format. Use 4–12 alphanumerics with spaces or hyphens.")
        }
        const conflict = await db.vehicles.findUnique({ where: { license_plate } })
        if (conflict && conflict.vehicle_id !== vehicle_id) {
          throw new Error("License plate already exists.")
        }
      }

      // VIN uniqueness
      let vin: string | undefined = rest.vin
      if (typeof vin === "string") {
        vin = normalizeVIN(vin)
        if (!isVINLengthValid(vin)) {
          throw new Error("Invalid VIN. Must be between 11 and 20 characters (17 typical).")
        }
        const conflictVin = await db.vehicles.findUnique({ where: { vin } })
        if (conflictVin && conflictVin.vehicle_id !== vehicle_id) {
          throw new Error("VIN already exists.")
        }
      }

      // HSN
      let hsn: string | undefined = rest.hsn
      if (typeof hsn === "string") {
        hsn = hsn.toUpperCase()
        if (!isHSNValid(hsn)) {
          throw new Error("Invalid HSN. Must be exactly 4 alphanumeric characters.")
        }
      }

      // TSN
      let tsn: string | undefined = rest.tsn
      if (typeof tsn === "string") {
        tsn = tsn.toUpperCase()
        if (!isTSNValid(tsn)) {
          throw new Error("Invalid TSN. Must be exactly 3 alphanumeric characters.")
        }
      }

      // Year and mileage
      if (typeof rest.year === "number" && !isYearValid(rest.year)) {
        throw new Error("Invalid year. Must be between 1950 and 2100.")
      }
      if (typeof rest.km === "number" && !isKmValid(rest.km)) {
        throw new Error("Invalid mileage. Must be a non-negative integer ≤ 2,000,000.")
      }

      // Dates (if provided)
      const tuvDate =
        rest.tuv_date === undefined ? undefined : toDateOrUndefined(rest.tuv_date)
      const lastServiceDate =
        rest.last_service_date === undefined ? undefined : toDateOrUndefined(rest.last_service_date)

      try {
        const updated = await db.vehicles.update({
          where: { vehicle_id },
          data: {
            ...(typeof rest.client_id === "number" ? { client_id: rest.client_id } : {}),
            ...(rest.make !== undefined ? { make: rest.make?.trim() } : {}),
            ...(rest.model !== undefined ? { model: rest.model?.trim() } : {}),
            ...(rest.year !== undefined ? { year: rest.year } : {}),
            ...(rest.km !== undefined ? { km: rest.km } : {}),
            ...(rest.fuel_type !== undefined ? { fuel_type: rest.fuel_type } : {}),
            ...(rest.drive !== undefined ? { drive: rest.drive } : {}),
            ...(rest.transmission !== undefined ? { transmission: rest.transmission } : {}),
            ...(license_plate ? { license_plate } : {}),
            ...(vin ? { vin } : {}),
            ...(hsn ? { hsn } : {}),
            ...(tsn ? { tsn } : {}),
            ...(tuvDate !== undefined ? { tuv_date: tuvDate } : {}),
            ...(lastServiceDate !== undefined ? { last_service_date: lastServiceDate } : {}),
          },
          include: { client: true },
        })
        return updated
      } catch (err: unknown) {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === "P2002") {
            const target = (err.meta?.target as string[])?.join(", ") || "unique field"
            if (target.includes("vin")) throw new Error("VIN already exists.")
            if (target.includes("license_plate"))
              throw new Error("License plate already exists.")
            throw new Error(`Uniqueness conflict on ${target}.`)
          }
        }
        throw err
      }
    },

    deleteVehicle: async (_: unknown, { vehicleId }: { vehicleId: number }, { db }: Context) => {
      await db.vehicles.delete({ where: { vehicle_id: vehicleId } })
      return true
    },
  },
}