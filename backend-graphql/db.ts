// backend-graphql/db.ts

import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();
