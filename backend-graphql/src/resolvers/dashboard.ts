// backend-graphql/src/resolvers/dashboard.ts

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
        createdAt: order.createdAt.toISOString(),
        status: order.status,
      }))
    },
  },
}
