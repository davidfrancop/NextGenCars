// backend-graphql/src/context.ts

import type { PrismaClient } from "@prisma/client"
import { db } from "../db"
import jwt from "jsonwebtoken"

export interface AuthUser {
  sub: number
  email: string
  role: string
}

export type Context = {
  db: PrismaClient
  user?: AuthUser
}

export function createContext({ request }: { request: Request }): Context {
  let user: AuthUser | undefined

  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!)
      if (
        typeof decoded === "object" &&
        decoded !== null &&
        "sub" in decoded &&
        "email" in decoded &&
        "role" in decoded
      ) {
        user = decoded as unknown as AuthUser
      }
    } catch {
      // token inválido o expirado → user queda undefined
    }
  }

  return { db, user }
}
