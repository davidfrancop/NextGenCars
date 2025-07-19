// control/app/utils/db.server.ts
import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();
