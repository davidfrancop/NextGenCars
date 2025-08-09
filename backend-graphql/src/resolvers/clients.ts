// backend-graphql/src/resolvers/clients.ts
import { db } from "../../db"

export const clientsResolvers = {
  Query: {
    personalClients: async () => {
      return db.clients.findMany({ where: { type: "personal" } })
    },
    clients: async () => {
      return db.clients.findMany()
    },
    client: async (_: unknown, { client_id }: { client_id: number }) => {
      return db.clients.findUnique({ where: { client_id } })
    },
  },

  Mutation: {
    createClient: async (
      _: unknown,
      args: {
        first_name: string
        last_name: string
        email?: string
        phone?: string
        country?: string
        type: string
      }
    ) => {
      const { first_name, last_name, email, phone, country, type } = args
      return db.clients.create({
        data: { first_name, last_name, email, phone, country, type },
      })
    },

    updateClient: async (
      _: unknown,
      args: {
        client_id: number
        first_name?: string
        last_name?: string
        email?: string
        phone?: string
        country?: string
        type?: string
      }
    ) => {
      const { client_id, ...data } = args
      return db.clients.update({
        where: { client_id },
        data,
      })
    },

    deleteClient: async (_: unknown, { clientId }: { clientId: number }) => {
      await db.clients.delete({ where: { client_id: clientId } })
      return true
    },
  },
}
