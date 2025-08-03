// backend-graphql/src/resolvers/dashboard.ts

import { prisma } from "../../db"
import { eachDayOfInterval, startOfWeek, endOfWeek, format } from "date-fns"

export const dashboardResolvers = {
  Query: {
    dashboardStats: async (_: any, __: any, { prisma }) => {
      const [vehicles, workOrders, clients, revenueResult] = await Promise.all([
        prisma.vehicle.count(),
        prisma.workOrder.count(),
        prisma.client.count(),
        prisma.workOrder.aggregate({
          _sum: { total: true },
        }),
      ])

      return {
        vehicles,
        workOrders,
        clients,
        revenue: revenueResult._sum.total ?? 0,
      }
    },

    recentWorkOrders: async (_: any, __: any, { prisma }) => {
      const orders = await prisma.workOrder.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          client: true,
          vehicle: true,
        },
      })

      return orders.map((order) => ({
        id: order.id.toString(),
        clientName: `${order.client.firstName} ${order.client.lastName}`,
        vehicleName: `${order.vehicle.make} ${order.vehicle.model}`,
        vehiclePlate: order.vehicle.plate,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
      }))
    },

    appointmentsThisWeek: async () => {
      const start = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
      const end = endOfWeek(new Date(), { weekStartsOn: 1 })     // Sunday

      const appointments = await prisma.appointment.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
      })

      const weekDays = eachDayOfInterval({ start, end })

      const result = weekDays.map((day) => {
        const label = format(day, "EEE") // 'Mon', 'Tue', etc.
        const count = appointments.filter(
          (a) => format(new Date(a.date), "EEE") === label
        ).length

        return { day: label, count }
      })

      return result
    },
  },
}

