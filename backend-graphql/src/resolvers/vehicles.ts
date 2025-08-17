// backend-graphql/src/resolvers/vehicles.ts

import type { Context } from "../context"

/* =========================
   Utilidades de validación
   ========================= */
const normalizePlate = (raw?: string | null) =>
  (raw ?? "").toUpperCase().replace(/\s+/g, " ").trim()

const isPlateFormatValid = (plate: string) =>
  /^[A-Z0-9\- ]{4,12}$/.test(plate) // letras/números + espacio/guion (4–12)

const normalizeVIN = (raw?: string | null) => (raw ?? "").toUpperCase().trim()

// 17 típico; dejamos 11–20 por flexibilidad
const isVINLengthValid = (vin: string) => vin.length >= 11 && vin.length <= 20

const isHSNValid = (hsn?: string | null) => !!hsn && /^[A-Z0-9]{4}$/.test(hsn.toUpperCase())
const isTSNValid = (tsn?: string | null) => !!tsn && /^[A-Z0-9]{3}$/.test(tsn.toUpperCase())

const isYearValid = (year?: number | null) =>
  typeof year === "number" && year >= 1950 && year <= 2100

const isKmValid = (km?: number | null) =>
  typeof km === "number" && km >= 0 && km <= 2_000_000

// Entrada: String ISO o string numérico (epoch ms). Devuelve Date o undefined.
const toDateOrUndefined = (raw?: string | null): Date | undefined => {
  if (!raw) return undefined
  let d: Date
  if (/^\d+$/.test(raw)) d = new Date(Number(raw)) // "1767830400000"
  else d = new Date(raw)
  return isNaN(d.getTime()) ? undefined : d
}

// Salida: normaliza Date | number | string a ISO; null si no válido
const toIsoString = (v: any): string | null => {
  if (!v) return null
  if (v instanceof Date) return v.toISOString()
  if (typeof v === "number") return new Date(v).toISOString()
  if (typeof v === "string") {
    if (/^\d+$/.test(v)) return new Date(Number(v)).toISOString()
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d.toISOString()
  }
  return null
}

export const vehicleResolvers = {
  /* Campos de tipo (resuelven relaciones y normalizan fechas) */
  Vehicle: {
    client: async (parent: { client_id: number }, _args: unknown, { db }: Context) => {
      return db.clients.findUnique({ where: { client_id: parent.client_id } })
    },
    // ⬇️ Normalización de fechas a ISO en respuestas GraphQL
    tuv_date: (parent: any) => toIsoString(parent?.tuv_date),
    last_service_date: (parent: any) => toIsoString(parent?.last_service_date),
    created_at: (parent: any) => toIsoString(parent?.created_at),
    updated_at: (parent: any) => toIsoString(parent?.updated_at),
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
        tuv_date?: string | null
        last_service_date?: string | null
      },
      { db }: Context
    ) => {
      // Normalización
      const license_plate = normalizePlate(args.license_plate)
      const vin = normalizeVIN(args.vin)
      const hsn = args.hsn.toUpperCase()
      const tsn = args.tsn.toUpperCase()

      // Validaciones
      if (!isPlateFormatValid(license_plate)) {
        throw new Error("Formato de matrícula inválido. Use letras/números con espacios o guiones (4–12).")
      }
      if (!isVINLengthValid(vin)) {
        throw new Error("VIN inválido. Debe tener entre 11 y 20 caracteres (17 habitual).")
      }
      if (!isHSNValid(hsn)) {
        throw new Error("HSN inválido. Debe ser alfanumérico de 4 caracteres.")
      }
      if (!isTSNValid(tsn)) {
        throw new Error("TSN inválido. Debe ser alfanumérico de 3 caracteres.")
      }
      if (!isYearValid(args.year)) {
        throw new Error("Año inválido. Debe estar entre 1950 y 2100.")
      }
      if (!isKmValid(args.km)) {
        throw new Error("KM inválido. Debe ser un número entre 0 y 2,000,000.")
      }

      // Unicidad
      const [plateExists, vinExists] = await Promise.all([
        db.vehicles.findUnique({ where: { license_plate } }),
        db.vehicles.findUnique({ where: { vin } }),
      ])
      if (plateExists) throw new Error("La matrícula ya existe.")
      if (vinExists) throw new Error("El VIN ya existe.")

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
            tuv_date: toDateOrUndefined(args.tuv_date),
            last_service_date: toDateOrUndefined(args.last_service_date),
          },
        })
      } catch (err: any) {
        if (err?.code === "P2002") {
          const target = (err.meta?.target as string[])?.join(", ") || "campo único"
          if (target.includes("vin")) throw new Error("El VIN ya existe.")
          if (target.includes("license_plate")) throw new Error("La matrícula ya existe.")
          throw new Error(`Conflicto de unicidad en ${target}.`)
        }
        throw err
      }
    },

    updateVehicle: async (
      _: unknown,
      args: {
        vehicle_id: number
        make?: string
        model?: string
        year?: number
        // Alias 'plate' desde el front; Prisma usa 'license_plate'
        plate?: string
        license_plate?: string
        vin?: string
        hsn?: string
        tsn?: string
        fuel_type?: string
        drive?: string
        transmission?: string
        km?: number
        tuv_date?: string | null
        last_service_date?: string | null
      },
      { db }: Context
    ) => {
      const { vehicle_id, ...rest } = args

      // Matrícula: soporta 'plate' o 'license_plate'
      const incomingPlate = rest.plate ?? rest.license_plate
      let license_plate: string | undefined
      if (typeof incomingPlate === "string") {
        license_plate = normalizePlate(incomingPlate)
        if (!isPlateFormatValid(license_plate)) {
          throw new Error("Formato de matrícula inválido. Use letras/números con espacios o guiones (4–12).")
        }
        const conflict = await db.vehicles.findUnique({ where: { license_plate } })
        if (conflict && conflict.vehicle_id !== vehicle_id) {
          throw new Error("La matrícula ya existe.")
        }
      }

      let vin: string | undefined = rest.vin
      if (typeof vin === "string") {
        vin = normalizeVIN(vin)
        if (!isVINLengthValid(vin)) {
          throw new Error("VIN inválido. Debe tener entre 11 y 20 caracteres (17 habitual).")
        }
        const conflictVin = await db.vehicles.findUnique({ where: { vin } })
        if (conflictVin && conflictVin.vehicle_id !== vehicle_id) {
          throw new Error("El VIN ya existe.")
        }
      }

      let hsn: string | undefined = rest.hsn
      if (typeof hsn === "string") {
        hsn = hsn.toUpperCase()
        if (!isHSNValid(hsn)) {
          throw new Error("HSN inválido. Debe ser alfanumérico de 4 caracteres.")
        }
      }

      let tsn: string | undefined = rest.tsn
      if (typeof tsn === "string") {
        tsn = tsn.toUpperCase()
        if (!isTSNValid(tsn)) {
          throw new Error("TSN inválido. Debe ser alfanumérico de 3 caracteres.")
        }
      }

      if (typeof rest.year === "number" && !isYearValid(rest.year)) {
        throw new Error("Año inválido. Debe estar entre 1950 y 2100.")
      }

      if (typeof rest.km === "number" && !isKmValid(rest.km)) {
        throw new Error("KM inválido. Debe ser un número entre 0 y 2,000,000.")
      }

      // Fechas (si vienen) — aceptan ISO y epoch ms (string)
      const tuvDate =
        rest.tuv_date === undefined ? undefined : toDateOrUndefined(rest.tuv_date)
      const lastServiceDate =
        rest.last_service_date === undefined ? undefined : toDateOrUndefined(rest.last_service_date)

      try {
        const updated = await db.vehicles.update({
          where: { vehicle_id },
          data: {
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
        })
        return updated
      } catch (err: any) {
        if (err?.code === "P2002") {
          const target = (err.meta?.target as string[])?.join(", ") || "campo único"
          if (target.includes("vin")) throw new Error("El VIN ya existe.")
          if (target.includes("license_plate")) throw new Error("La matrícula ya existe.")
          throw new Error(`Conflicto de unicidad en ${target}.`)
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
