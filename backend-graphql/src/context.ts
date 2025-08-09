// backend-graphql/src/context.ts

import type { PrismaClient } from "@prisma/client";
import { db } from "../db";

export type Context = { db: PrismaClient };

export const context: Context = { db };
