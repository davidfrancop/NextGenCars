// backend-graphql/src/resolvers/index.ts

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../db"; // o ajusta si está en otro lado

export const resolvers = {
  Query: {
    hello: () => "Hello from NextGen Cars GraphQL backend",
  },

  Mutation: {
    loginUser: async (
      _: unknown,
      args: { email: string; password: string }
    ) => {
      const { email, password } = args;

      const user = await db.users.findUnique({ where: { email } });
      if (!user) {
        throw new Error("Invalid credentials");
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        throw new Error("Invalid credentials");
      }

      const token = jwt.sign(
        {
          id: user.user_id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );

      return { token };
    },
  },
};
