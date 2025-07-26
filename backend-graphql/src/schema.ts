// backend-graphql/src/schema.ts

import { createSchema } from "graphql-yoga";
import { resolvers } from "./resolvers";

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      hello: String!
    }

    type Mutation {
      loginUser(email: String!, password: String!): LoginResponse!
    }

    type LoginResponse {
      token: String!
    }
  `,
  resolvers,
});
