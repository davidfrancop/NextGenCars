// backend-graphql/src/resolvers/users.ts

import { Context } from "../context"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { GraphQLError } from "graphql"

function signToken(user: { user_id: number; email: string; role: string }) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not set")
  return jwt.sign({ sub: user.user_id, email: user.email, role: user.role }, secret, { expiresIn: "7d" })
}

// Helper para serializar fechas a ISO de forma segura
function withIsoDates<T extends { created_at?: any; updated_at?: any }>(row: T) {
  return {
    ...row,
    created_at: row?.created_at instanceof Date ? row.created_at.toISOString() : row?.created_at ?? null,
    updated_at: row?.updated_at instanceof Date ? row.updated_at.toISOString() : row?.updated_at ?? null,
  }
}

export const userResolvers = {
  Query: {
    users: async (_: unknown, __: unknown, { db }: Context) => {
      const rows = await db.users.findMany({
        orderBy: { created_at: "desc" },
        select: {
          user_id: true,
          username: true,
          email: true,
          role: true,
          created_at: true,
          updated_at: true,
        },
      })
      return rows.map(withIsoDates)
    },

    user: async (_: unknown, { userId }: { userId: number }, { db }: Context) => {
      const found = await db.users.findUnique({
        where: { user_id: userId },
        select: {
          user_id: true,
          username: true,
          email: true,
          role: true,
          created_at: true,
          updated_at: true,
        },
      })
      if (!found) {
        throw new GraphQLError("Usuario no encontrado", { extensions: { code: "NOT_FOUND" } })
      }
      return withIsoDates(found)
    },
  },

  Mutation: {
    createUser: async (
      _: unknown,
      args: { username: string; email: string; password: string; role: string },
      { db }: Context
    ) => {
      const { username, email, password, role } = args
      const password_hash = await bcrypt.hash(password, 10)

      const exists = await db.users.findUnique({ where: { email } })
      if (exists) {
        throw new GraphQLError("Email ya está en uso", { extensions: { code: "BAD_USER_INPUT" } })
      }

      const created = await db.users.create({
        data: {
          username,
          email,
          role,
          password_hash,
          // por si tu esquema no tiene @default(now()) o hay motores que no lo aplican
          created_at: new Date(),
        },
        select: {
          user_id: true,
          username: true,
          email: true,
          role: true,
          created_at: true,
          updated_at: true,
        },
      })
      return withIsoDates(created)
    },

    updateUser: async (
      _: unknown,
      args: { userId: number; username: string; email: string; role: string; password?: string },
      { db }: Context
    ) => {
      const { userId, username, email, role, password } = args

      const existing = await db.users.findUnique({ where: { user_id: userId } })
      if (!existing) {
        throw new GraphQLError("Usuario no encontrado", { extensions: { code: "NOT_FOUND" } })
      }

      if (email !== existing.email) {
        const emailTaken = await db.users.findUnique({ where: { email } })
        if (emailTaken) {
          throw new GraphQLError("Email ya está en uso", { extensions: { code: "BAD_USER_INPUT" } })
        }
      }

      const data: any = { username, email, role }
      if (password && password.trim() !== "") {
        data.password_hash = await bcrypt.hash(password, 10)
      }

      const updated = await db.users.update({
        where: { user_id: userId },
        data,
        select: {
          user_id: true,
          username: true,
          email: true,
          role: true,
          created_at: true,
          updated_at: true,
        },
      })
      return withIsoDates(updated)
    },

    loginUser: async (_: unknown, args: { email: string; password: string }, { db }: Context) => {
      const { email, password } = args
      const user = await db.users.findUnique({ where: { email } })
      if (!user) {
        throw new GraphQLError("Invalid credentials", { extensions: { code: "UNAUTHENTICATED" } })
      }
      const ok = await bcrypt.compare(password, user.password_hash)
      if (!ok) {
        throw new GraphQLError("Invalid credentials", { extensions: { code: "UNAUTHENTICATED" } })
      }
      const token = signToken(user)
      return { token }
    },

    deleteUser: async (_: unknown, args: { userId: number }, { db, user }: Context) => {
      const { userId } = args

      if (user && user.sub && Number(user.sub) === userId) {
        throw new GraphQLError("No puedes eliminar tu propio usuario.", { extensions: { code: "FORBIDDEN" } })
      }
      if (userId === 1) {
        throw new GraphQLError("No se puede eliminar el admin principal.", { extensions: { code: "FORBIDDEN" } })
      }

      const toDelete = await db.users.findUnique({ where: { user_id: userId } })
      if (!toDelete) {
        throw new GraphQLError("Usuario no encontrado.", { extensions: { code: "NOT_FOUND" } })
      }

      const deleted = await db.users.delete({
        where: { user_id: userId },
        select: {
          user_id: true,
          username: true,
          email: true,
          role: true,
          created_at: true,
          updated_at: true,
        },
      })
      return withIsoDates(deleted)
    },
  },
}
