// backend-graphql/src/schema.ts

import { createSchema } from "graphql-yoga"
import { resolvers } from "./resolvers"

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type User {
      user_id: Int!
      username: String!
      email: String!
      role: String!
      created_at: String
    }

    type LoginResponse {
      token: String!
    }

    type Query {
      hello: String!
      users: [User!]!
    }

    type Mutation {
      loginUser(email: String!, password: String!): LoginResponse!
    }
  `,
  resolvers
})
