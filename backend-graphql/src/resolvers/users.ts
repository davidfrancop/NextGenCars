// backend-graphql/src/resolvers/users.ts

import { Context } from "../context"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { GraphQLError } from "graphql"

function signToken(user: { user_id: number; email: string; role: string }) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not set")
  }
  return jwt.sign(
    { sub: user.user_id, email: user.email, role: user.role },
    secret,
    { expiresIn: "7d" }
  )
}

export const userResolvers = {
  Query: {
    users: async (_: unknown, __: unknown, { db }: Context) => {
      return db.users.findMany({ orderBy: { created_at: "desc" } })
    },

    // 🔎 Obtener usuario por ID
    user: async (_: unknown, { userId }: { userId: number }, { db }: Context) => {
      const found = await db.users.findUnique({ where: { user_id: userId } })
      if (!found) {
        throw new GraphQLError("Usuario no encontrado", {
          extensions: { code: "NOT_FOUND" },
        })
      }
      return found
    },
  },

  Mutation: {
    // ➕ Crear usuario (con hash)
    createUser: async (
      _: unknown,
      args: { username: string; email: string; password: string; role: string },
      { db }: Context
    ) => {
      const { username, email, password, role } = args
      const password_hash = await bcrypt.hash(password, 10)

      const exists = await db.users.findUnique({ where: { email } })
      if (exists) {
        throw new GraphQLError("Email ya está en uso", {
          extensions: { code: "BAD_USER_INPUT" },
        })
      }

      return db.users.create({
        data: { username, email, role, password_hash },
      })
    },

    // ✏️ Actualizar usuario
    updateUser: async (
      _: unknown,
      args: {
        userId: number
        username: string
        email: string
        role: string
        password?: string
      },
      { db }: Context
    ) => {
      const { userId, username, email, role, password } = args

      // Verificar existencia
      const existing = await db.users.findUnique({ where: { user_id: userId } })
      if (!existing) {
        throw new GraphQLError("Usuario no encontrado", {
          extensions: { code: "NOT_FOUND" },
        })
      }

      // Validar email único si se cambia
      if (email !== existing.email) {
        const emailTaken = await db.users.findUnique({ where: { email } })
        if (emailTaken) {
          throw new GraphQLError("Email ya está en uso", {
            extensions: { code: "BAD_USER_INPUT" },
          })
        }
      }

      const updateData: any = { username, email, role }
      if (password && password.trim() !== "") {
        updateData.password_hash = await bcrypt.hash(password, 10)
      }

      return db.users.update({
        where: { user_id: userId },
        data: updateData,
      })
    },

    // 🔐 Login
    loginUser: async (
      _: unknown,
      args: { email: string; password: string },
      { db }: Context
    ) => {
      const { email, password } = args

      const user = await db.users.findUnique({ where: { email } })
      if (!user) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHENTICATED" },
        })
      }

      const ok = await bcrypt.compare(password, user.password_hash)
      if (!ok) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHENTICATED" },
        })
      }

      const token = signToken(user)
      return { token }
    },

    // 🗑️ Eliminar usuario
    deleteUser: async (
      _: unknown,
      args: { userId: number },
      { db, user }: Context
    ) => {
      const { userId } = args

      if (user && user.sub && Number(user.sub) === userId) {
        throw new GraphQLError("No puedes eliminar tu propio usuario.", {
          extensions: { code: "FORBIDDEN" },
        })
      }

      if (userId === 1) {
        throw new GraphQLError("No se puede eliminar el admin principal.", {
          extensions: { code: "FORBIDDEN" },
        })
      }

      const toDelete = await db.users.findUnique({ where: { user_id: userId } })
      if (!toDelete) {
        throw new GraphQLError("Usuario no encontrado.", {
          extensions: { code: "NOT_FOUND" },
        })
      }

      return db.users.delete({
        where: { user_id: userId },
      })
    },
  },
}
