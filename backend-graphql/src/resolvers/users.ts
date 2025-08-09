// backend-graphql/src/resolvers/users.ts
import { Context } from "../context";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";

function signToken(user: { user_id: number; email: string; role: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.sign(
    { sub: user.user_id, email: user.email, role: user.role },
    secret,
    { expiresIn: "7d" }
  );
}

export const userResolvers = {
  Query: {
    users: async (_: unknown, __: unknown, { db }: Context) => {
      return db.users.findMany({ orderBy: { created_at: "desc" } });
    },
  },

  Mutation: {
    // signup de ejemplo (crea con hash)
    createUser: async (
      _: unknown,
      args: { username: string; email: string; password: string; role: string },
      { db }: Context
    ) => {
      const { username, email, password, role } = args;
      const password_hash = await bcrypt.hash(password, 10);
      return db.users.create({
        data: { username, email, role, password_hash },
      });
    },

    // login real
    loginUser: async (
      _: unknown,
      args: { email: string; password: string },
      { db }: Context
    ) => {
      const { email, password } = args;

      const user = await db.users.findUnique({ where: { email } });
      if (!user) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // OJO: user.password_hash debe estar encriptado con bcrypt
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const token = signToken(user);
      return { token };
    },
  },
};
