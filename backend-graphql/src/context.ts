// backend-graphql/src/context.ts

import type { PrismaClient } from "@prisma/client"
import { db } from "../db"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "./config"
import { logger } from "./logger"
import { Role, isRole } from "./roles"

export interface AuthUser {
  sub: number
  email: string
  role: Role
}

export type Context = {
  db: PrismaClient
  user?: AuthUser
}

export function createContext({ request }: { request: Request }): Context {
  let user: AuthUser | undefined

  // 👇 acepta 'authorization' y 'Authorization'
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization")

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim()
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any

      if (
        decoded &&
        typeof decoded === "object" &&
        "sub" in decoded &&
        "email" in decoded &&
        "role" in decoded
      ) {
        const roleStr = String(decoded.role).toLowerCase()
          if (isRole(roleStr)) {
            user = {
              sub: Number(decoded.sub),
              email: String(decoded.email),
              role: roleStr,
            }
          }
      }
    } catch {
      // token inválido/expirado → user indefinido
    }
  }

  if (process.env.NODE_ENV !== "production") {
    logger.debug("[Context] Authorization header:", authHeader)
    logger.debug("[Context] user:", user)
  }

  return { db, user }
}
