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

    type DashboardStats {
      vehicles: Int!
      workOrders: Int!
      clients: Int!
      revenue: Float!
    }

    type WorkOrderPreview {
      id: ID!
      clientName: String!
      vehicleName: String!
      vehiclePlate: String!
      createdAt: String!
      status: String!
    }

    type Query {
      hello: String!
      users: [User!]!
      dashboardStats: DashboardStats!
      recentWorkOrders: [WorkOrderPreview!]!
    }

    type Mutation {
      loginUser(email: String!, password: String!): LoginResponse!
      createUser(
        username: String!
        email: String!
        password: String!
        role: String!
      ): User!
    }
  `,
  resolvers,
})
