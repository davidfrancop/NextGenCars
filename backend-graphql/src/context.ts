// backend-graphql/src/context.ts

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const context = {
  db: prisma
}
