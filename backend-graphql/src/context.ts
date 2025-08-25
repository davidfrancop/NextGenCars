// backend-graphql/src/context.ts

import type { PrismaClient } from "@prisma/client"
import { db } from "../db"              // 👈 corregido
import jwt from "jsonwebtoken"

export type Role = "admin" | "frontdesk" | "mechanic"
const VALID_ROLES = new Set<Role>(["admin", "frontdesk", "mechanic"])

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
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

      if (
        decoded &&
        typeof decoded === "object" &&
        "sub" in decoded &&
        "email" in decoded &&
        "role" in decoded
      ) {
        const roleStr = String(decoded.role).toLowerCase()
        if (VALID_ROLES.has(roleStr as Role)) {
          user = {
            sub: Number(decoded.sub),
            email: String(decoded.email),
            role: roleStr as Role,
          }
        }
      }
    } catch {
      // token inválido/expirado → user indefinido
    }
  }

  return { db, user }
}
