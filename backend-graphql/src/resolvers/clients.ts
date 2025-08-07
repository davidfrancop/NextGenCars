// backend-graphql/src/resolvers/clients.ts

import { db } from "../../db" // tu acceso global directo a PrismaClient

export const clientsResolvers = {
  Query: {
    // Lista solo clientes personales
    personalClients: async () => {
      return await db.clients.findMany({
        where: { type: "personal" },
      })
    },

    // Lista todos los clientes (personal y empresa)
    clients: async () => {
      return await db.clients.findMany()
    },
  },

  Mutation: {
    // Crea un nuevo cliente
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
      const {
        first_name,
        last_name,
        email,
        phone,
        country,
        type,
      } = args

      console.log("🆕 Creating client:", first_name, last_name)

      return await db.clients.create({
        data: {
          first_name,
          last_name,
          email,
          phone,
          country,
          type,
        },
      })
    },
  },
}
