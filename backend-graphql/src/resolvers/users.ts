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
      const list = await db.users.findMany({ orderBy: { created_at: "desc" } })
      // 🔹 normalizamos el campo a ISO string para evitar "Invalid Date" en frontend
      return list.map((u) => ({
        ...u,
        created_at: u.created_at ? new Date(u.created_at).toISOString() : null,
      }))
    },

    user: async (_: unknown, { userId }: { userId: number }, { db }: Context) => {
      const found = await db.users.findUnique({ where: { user_id: userId } })
      if (!found) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" },
        })
      }
      return {
        ...found,
        created_at: found.created_at ? new Date(found.created_at).toISOString() : null,
      }
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
        throw new GraphQLError("Email already in use", {
          extensions: { code: "BAD_USER_INPUT" },
        })
      }

      const newUser = await db.users.create({
        data: {
          username,
          email,
          role,
          password_hash,
          created_at: new Date(), // 🔹 aseguramos fecha al crear
        },
      })

      return {
        ...newUser,
        created_at: newUser.created_at.toISOString(),
      }
    },

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
      const existing = await db.users.findUnique({ where: { user_id: userId } })
      if (!existing) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" },
        })
      }

      if (email !== existing.email) {
        const emailTaken = await db.users.findUnique({ where: { email } })
        if (emailTaken) {
          throw new GraphQLError("Email already in use", {
            extensions: { code: "BAD_USER_INPUT" },
          })
        }
      }

      const updateData: any = { username, email, role }
      if (password && password.trim() !== "") {
        updateData.password_hash = await bcrypt.hash(password, 10)
      }

      const updated = await db.users.update({
        where: { user_id: userId },
        data: updateData,
      })

      return {
        ...updated,
        created_at: updated.created_at ? new Date(updated.created_at).toISOString() : null,
      }
    },

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

    deleteUser: async (
      _: unknown,
      args: { userId: number },
      { db, user }: Context
    ) => {
      const { userId } = args

      if (user && user.sub && Number(user.sub) === userId) {
        throw new GraphQLError("You cannot delete your own account.", {
          extensions: { code: "FORBIDDEN" },
        })
      }

      if (userId === 1) {
        throw new GraphQLError("Primary admin cannot be deleted.", {
          extensions: { code: "FORBIDDEN" },
        })
      }

      const toDelete = await db.users.findUnique({ where: { user_id: userId } })
      if (!toDelete) {
        throw new GraphQLError("User not found.", {
          extensions: { code: "NOT_FOUND" },
        })
      }

      const deleted = await db.users.delete({ where: { user_id: userId } })
      return {
        ...deleted,
        created_at: deleted.created_at ? new Date(deleted.created_at).toISOString() : null,
      }
    },
  },
}