// backend-graphql/src/resolvers/work_orders.ts

import type { Context } from "../context"
import { Prisma } from "@prisma/client"
import { logger } from "../logger"
import { GraphQLError } from "graphql"

// -------- RBAC: types + guards (tolerantes con user.role: string) --------
export const ROLES = ["admin", "frontdesk", "mechanic"] as const
export type Role = typeof ROLES[number]

type AuthUserLoose = { role?: string | null } & Record<string, any>

function isRole(x: unknown): x is Role {
  return typeof x === "string" && (ROLES as readonly string[]).includes(x as Role)
}

/** Asegura auth y estrecha el tipo del role a la unión `Role` */
function ensureAuth(user?: AuthUserLoose | null): asserts user is (AuthUserLoose & { role: Role }) {
  if (!user) {
    throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHENTICATED" } })
  }
  if (!isRole(user.role)) {
    throw new GraphQLError("Forbidden: unknown role", { extensions: { code: "FORBIDDEN" } })
  }
}

function requireAnyRole(user: { role: Role }, roles: Role[]) {
  if (!roles.includes(user.role)) {
    throw new GraphQLError("Forbidden: insufficient permissions", {
      extensions: { code: "FORBIDDEN" },
    })
  }
}

function canRead(user?: AuthUserLoose | null) {
  ensureAuth(user)
  requireAnyRole(user, ["admin", "frontdesk", "mechanic"])
}

function canMutate(user?: AuthUserLoose | null) {
  ensureAuth(user)
  requireAnyRole(user, ["admin", "frontdesk"])
}

// -------- Filtros --------
type Filter = {
  status?: "OPEN" | "IN_PROGRESS" | "ON_HOLD" | "CLOSED" | "CANCELED"
  client_id?: number
  vehicle_id?: number
  assigned_user_id?: number
  from?: string // ISO
  to?: string   // ISO
  search?: string
  q?: string
}

const buildWhere = (f?: Filter): Prisma.work_ordersWhereInput | undefined => {
  if (!f) return undefined
  const where: Prisma.work_ordersWhereInput = {}

  // filtros directos
  if (f.status) where.status = f.status as any
  if (f.client_id) where.client_id = f.client_id
  if (f.vehicle_id) where.vehicle_id = f.vehicle_id
  if (f.assigned_user_id) where.assigned_user_id = f.assigned_user_id

  const OR: Prisma.work_ordersWhereInput[] = []

  // rango de fechas (cualquiera de las 3 fechas)
  if (f.from || f.to) {
    const range: Prisma.DateTimeNullableFilter = {}
    if (f.from) range.gte = new Date(f.from)
    if (f.to) range.lte = new Date(f.to)
    OR.push({ scheduled_start: range }, { start_date: range }, { end_date: range })
  }

  // búsqueda de texto: usar search o q (alias aceptado por el frontend)
  const text = (f.search ?? f.q)?.trim()
  if (text) {
    const s = text
    OR.push({ title: { contains: s, mode: "insensitive" } })
    OR.push({ description: { contains: s, mode: "insensitive" } })
    OR.push({ vehicle: { license_plate: { contains: s, mode: "insensitive" } } })
    OR.push({
      client: {
        OR: [
          { first_name:   { contains: s, mode: "insensitive" } },
          { last_name:    { contains: s, mode: "insensitive" } },
          { company_name: { contains: s, mode: "insensitive" } },
        ],
      },
    })
  }

  if (OR.length) where.OR = OR
  return where
}

async function assertVehicleBelongsToClient(db: Context["db"], client_id: number, vehicle_id: number) {
  const vehicle = await db.vehicles.findUnique({ where: { vehicle_id } })
  if (!vehicle) {
    throw new GraphQLError("Vehicle not found", { extensions: { code: "NOT_FOUND" } })
  }
  if (vehicle.client_id !== client_id) {
    throw new GraphQLError("Vehicle does not belong to the specified client", {
      extensions: { code: "BAD_USER_INPUT" },
    })
  }
}

function preventIllegalCloseTransition(prev: string, next?: string | null) {
  if (!next) return
  const frozen = ["CLOSED", "CANCELED"]
  if (frozen.includes(prev) && !frozen.includes(next)) {
    throw new GraphQLError(`Cannot transition from ${prev} to ${next}`, {
      extensions: { code: "BAD_USER_INPUT" },
    })
  }
}

// -------- Resolvers --------
export const WorkOrdersResolvers = {
  Query: {
    workOrder: async (_: unknown, { work_order_id }: { work_order_id: number }, { db, user }: Context) => {
      // LOG: confirma user en peticiones de detalle
      logger.debug("[workOrder resolver] user:", user, "work_order_id:", work_order_id)
      canRead(user)
      return db.work_orders.findUnique({ where: { work_order_id } })
    },

    workOrders: async (
      _: unknown,
      { filter, skip = 0, take = 25 }: { filter?: Filter; skip?: number; take?: number },
      { db, user }: Context
    ) => {
      // LOG: confirma user y variables que llegan desde el cliente
      logger.debug("[workOrders resolver] user:", user)
      logger.debug("[workOrders resolver] args (raw):", { filter, skip, take })

      canRead(user)
      const where = buildWhere(filter)

      // LOG: cómo queda el where que va a Prisma
      logger.debug("[workOrders resolver] where:", JSON.stringify(where))

      const safeTake = Math.min(Math.max(take ?? 25, 1), 100)

      const [items, total] = await Promise.all([
        db.work_orders.findMany({
          where,
          skip,
          take: safeTake,
          orderBy: [{ created_at: "desc" }],
        }),
        db.work_orders.count({ where }),
      ])

      // LOG: resumen de resultados
      logger.debug("[workOrders resolver] result:", { total, itemsLen: items.length })

      return { items, total }
    },

    // útil para dashboard
    workOrdersRevenue: async (_: unknown, { from, to }: { from?: string; to?: string }, { db, user }: Context) => {
      logger.debug("[workOrdersRevenue resolver] user:", user, { from, to })
      canRead(user)
      const where: Prisma.work_ordersWhereInput = { status: "CLOSED" as any }
      if (from || to) {
        const range: Prisma.DateTimeNullableFilter = {}
        if (from) range.gte = new Date(from)
        if (to) range.lte = new Date(to)
        where.end_date = range
      }
      const agg = await db.work_orders.aggregate({ where, _sum: { total_cost: true } })
      const sum = agg._sum.total_cost ? Number(agg._sum.total_cost.toString()) : 0
      return sum
    },
  },

  Mutation: {
    createWorkOrder: async (_: unknown, { input }: { input: any }, { db, user }: Context) => {
      logger.debug("[createWorkOrder] user:", user)
      canMutate(user)
      await assertVehicleBelongsToClient(db, input.client_id, input.vehicle_id)

      return db.work_orders.create({
        data: {
          client_id: input.client_id,
          vehicle_id: input.vehicle_id,
          assigned_user_id: input.assigned_user_id ?? null,
          title: input.title,
          description: input.description ?? null,
          status: input.status ?? "OPEN",
          priority: input.priority ?? "MEDIUM",
          scheduled_start: input.scheduled_start ?? null,
          scheduled_end: input.scheduled_end ?? null,
          start_date: input.start_date ?? null,
          end_date: input.end_date ?? null,
          km_at_service: input.km_at_service ?? null,
          estimated_cost: input.estimated_cost ?? null,
          total_cost: input.total_cost ?? null,
          tasks: input.tasks ?? null,
        },
      })
    },

    updateWorkOrder: async (_: unknown, { work_order_id, input }: { work_order_id: number; input: any }, { db, user }: Context) => {
      logger.debug("[updateWorkOrder] user:", user, "work_order_id:", work_order_id)
      canMutate(user)
      const existing = await db.work_orders.findUnique({ where: { work_order_id } })
      if (!existing) {
        throw new GraphQLError("Work order not found", { extensions: { code: "NOT_FOUND" } })
      }

      preventIllegalCloseTransition(existing.status, input?.status)

      // si cambia client/vehicle, revalida la pertenencia
      const nextClient = input.client_id ?? existing.client_id
      const nextVehicle = input.vehicle_id ?? existing.vehicle_id
      if (nextClient !== existing.client_id || nextVehicle !== existing.vehicle_id) {
        await assertVehicleBelongsToClient(db, nextClient, nextVehicle)
      }

      return db.work_orders.update({
        where: { work_order_id },
        data: {
          client_id: input.client_id ?? undefined,
          vehicle_id: input.vehicle_id ?? undefined,
          assigned_user_id: input.assigned_user_id ?? undefined,
          title: input.title ?? undefined,
          description: input.description ?? undefined,
          status: input.status ?? undefined,
          priority: input.priority ?? undefined,
          scheduled_start: input.scheduled_start ?? undefined,
          scheduled_end: input.scheduled_end ?? undefined,
          start_date: input.start_date ?? undefined,
          end_date: input.end_date ?? undefined,
          km_at_service: input.km_at_service ?? undefined,
          estimated_cost: input.estimated_cost ?? undefined,
          total_cost: input.total_cost ?? undefined,
          tasks: input.tasks ?? undefined,
        },
      })
    },

    deleteWorkOrder: async (_: unknown, { work_order_id }: { work_order_id: number }, { db, user }: Context) => {
      logger.debug("[deleteWorkOrder] user:", user, "work_order_id:", work_order_id)
      canMutate(user)
      await db.work_orders.delete({ where: { work_order_id } })
      return true
    },
  },

  // Field resolvers
  WorkOrder: {
    // convertir Decimal -> Float para coincidir con el SDL (Float)
    estimated_cost: (parent: { estimated_cost?: any | null }) =>
      parent.estimated_cost != null ? Number(parent.estimated_cost) : null,
    total_cost: (parent: { total_cost?: any | null }) =>
      parent.total_cost != null ? Number(parent.total_cost) : null,

    client: (parent: { client_id: number }, _args: unknown, { db, user }: Context) => {
      logger.debug("[WorkOrder.client] user:", user, "client_id:", parent.client_id)
      canRead(user)
      return db.clients.findUnique({ where: { client_id: parent.client_id } })
    },
    vehicle: (parent: { vehicle_id: number }, _args: unknown, { db, user }: Context) => {
      logger.debug("[WorkOrder.vehicle] user:", user, "vehicle_id:", parent.vehicle_id)
      canRead(user)
      return db.vehicles.findUnique({ where: { vehicle_id: parent.vehicle_id } })
    },
    assigned_user: (parent: { assigned_user_id?: number | null }, _args: unknown, { db, user }: Context) => {
      logger.debug("[WorkOrder.assigned_user] user:", user, "assigned_user_id:", parent.assigned_user_id)
      canRead(user)
      return parent.assigned_user_id
        ? db.users.findUnique({ where: { user_id: parent.assigned_user_id } })
        : null
    },
  },
}
