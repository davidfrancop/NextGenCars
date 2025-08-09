import { eachDayOfInterval, startOfWeek, endOfWeek, format } from "date-fns";
import { Context } from "../context";

export const dashboardResolvers = {
  Query: {
    dashboardStats: async (_: unknown, __: unknown, { db }: Context) => {
      const [vehicles, workOrders, clients, revenueAgg] = await Promise.all([
        db.vehicles.count(),
        db.work_orders.count(),
        db.clients.count(),
        db.work_orders.aggregate({ _sum: { total_cost: true } }),
      ]);
      return {
        vehicles,
        workOrders,
        clients,
        revenue: revenueAgg._sum.total_cost ?? 0,
      };
    },
    recentWorkOrders: async (_: unknown, __: unknown, { db }: Context) => {
      const items = await db.work_orders.findMany({
        take: 5,
        orderBy: { created_at: "desc" },
        include: { vehicle: true, client: true },
      });
      return items.map(w => ({
        id: String(w.work_order_id),
        clientName: `${w.client.first_name} ${w.client.last_name}`,
        vehicleName: `${w.vehicle.make} ${w.vehicle.model}`,
        vehiclePlate: w.vehicle.license_plate,
        createdAt: w.created_at?.toISOString() ?? "",
        status: w.status,
      }));
    },
    appointmentsThisWeek: async (_: unknown, __: unknown, { db }: Context) => {
      const start = startOfWeek(new Date(), { weekStartsOn: 1 });
      const end = endOfWeek(new Date(), { weekStartsOn: 1 });
      const weekDays = eachDayOfInterval({ start, end });
      const appointments = await db.appointments.findMany({
        where: { date: { gte: start, lte: end } },
      });
      return weekDays.map(day => {
        const label = format(day, "EEE");
        const count = appointments.filter(a => format(a.date, "EEE") === label).length;
        return { day: label, count };
      });
    },
  },
};
