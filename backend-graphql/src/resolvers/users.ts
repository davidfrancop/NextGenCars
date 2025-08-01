// backend-graphql/src/resolvers/users.ts

import { db } from "../../db" // PrismaClient

export const userResolvers = {
  Query: {
    users: async () => {
      return await db.users.findMany()
    }
  }
}
