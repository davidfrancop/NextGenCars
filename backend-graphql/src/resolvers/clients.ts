import { Context } from "../context";

export const clientsResolvers = {
  Query: {
    clients: async (_: unknown, __: unknown, { db }: Context) => {
      return db.clients.findMany({ orderBy: { created_at: "desc" } });
    },
    personalClients: async (_: unknown, __: unknown, { db }: Context) => {
      return db.clients.findMany({ where: { type: "personal" } });
    },
    client: async (_: unknown, { client_id }: { client_id: number }, { db }: Context) => {
      return db.clients.findUnique({ where: { client_id } });
    },
  },
  Mutation: {
    createClient: async (_: unknown, args: {
      first_name: string; last_name: string; email?: string; phone?: string;
      country?: string; type: string; company_id?: number | null;
    }, { db }: Context) => {
      return db.clients.create({ data: { ...args } });
    },
    updateClient: async (_: unknown, args: {
      client_id: number; first_name?: string; last_name?: string; email?: string;
      phone?: string; country?: string; type?: string;
    }, { db }: Context) => {
      const { client_id, ...data } = args;
      return db.clients.update({ where: { client_id }, data });
    },
    deleteClient: async (_: unknown, { clientId }: { clientId: number }, { db }: Context) => {
      await db.clients.delete({ where: { client_id: clientId } });
      return true;
    },
  },
};
