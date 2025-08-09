// backend-graphql/src/context.ts
import { PrismaClient } from "@prisma/client"

export const db = new PrismaClient()

// Definimos el tipo Context que usará GraphQL Yoga
export type Context = {
  db: PrismaClient
}

// Exportamos el objeto que se pasa como contexto
export const context: Context = {
  db,
}
