// backend-graphql/src/config.ts

import "dotenv/config"

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is not defined")
}

export const JWT_SECRET = jwtSecret
