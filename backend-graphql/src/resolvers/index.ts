// backend-graphql/src/resolvers/index.ts

import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { db } from "../../db"

export const resolvers = {
  Query: {
    hello: () => "Hello from NextGen Cars GraphQL backend",

    users: async () => {
      console.log("📥 Consultando todos los usuarios...")
      return await db.users.findMany()
    },

    dashboardStats: async () => {
      console.log("📊 Calculando estadísticas del dashboard...")

      const [vehicles, workOrders, clients, revenueResult] = await Promise.all([
        db.vehicles.count(),
        db.work_orders.count(),
        db.clients.count(),
        db.work_orders.aggregate({
          _sum: { total_cost: true },
        }),
      ])

      return {
        vehicles,
        workOrders,
        clients,
        revenue: revenueResult._sum.total_cost ?? 0,
      }
    },

recentWorkOrders: async () => {
  console.log("📄 Cargando últimas órdenes de trabajo...")

  const orders = await db.work_orders.findMany({
    orderBy: { created_at: "desc" },
    take: 5,
    include: {
      client: true,
      vehicle: true,
    },
  })

  return orders.map((order) => ({
    id: order.id.toString(),
    clientName: `${order.client.first_name} ${order.client.last_name}`,
    vehicleName: `${order.vehicle.make} ${order.vehicle.model}`,
    vehiclePlate: order.vehicle.plate,
    createdAt: order.created_at.toISOString(),
    status: order.status,
  }))
},
  },

  Mutation: {
    loginUser: async (
      _: unknown,
      args: { email: string; password: string }
    ) => {
      const { email, password } = args

      console.log("🟡 Intentando login para:", email)

      const user = await db.users.findUnique({ where: { email } })

      if (!user) {
        console.log("🔴 Usuario NO encontrado:", email)
        throw new Error("Invalid email")
      }

      console.log("🟢 Usuario encontrado:", {
        id: user.user_id,
        email: user.email,
        role: user.role,
      })

      const valid = await bcrypt.compare(password, user.password_hash)

      console.log("🧪 Resultado bcrypt.compare:", valid)

      if (!valid) {
        console.log("🔴 Contraseña incorrecta para:", email)
        throw new Error("Invalid password")
      }

      const token = jwt.sign(
        {
          id: user.user_id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      )

      console.log("✅ Login exitoso. Token generado.")

      return { token }
    },

    createUser: async (
      _: unknown,
      args: { username: string; email: string; password: string; role: string }
    ) => {
      const { username, email, password, role } = args

      console.log("🆕 Creando nuevo usuario:", email)

      const existing = await db.users.findUnique({ where: { email } })

      if (existing) {
        console.log("⚠️ Ya existe un usuario con ese email")
        throw new Error("Email is already in use")
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const newUser = await db.users.create({
        data: {
          username,
          email,
          password_hash: hashedPassword,
          role,
        },
      })

      console.log("✅ Usuario creado correctamente:", newUser.user_id)

      return {
        user_id: newUser.user_id,
        email: newUser.email,
        role: newUser.role,
      }
    },
  },
}
