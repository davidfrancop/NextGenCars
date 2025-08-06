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

    type Client {
      client_id: Int!
      first_name: String!
      last_name: String!
      email: String
      phone: String
      country: String
      type: String!         # "personal" o "company"
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

    type AppointmentsPerDay {
      day: String!
      count: Int!
    }

    type Query {
      hello: String!
      users: [User!]!

      dashboardStats: DashboardStats!
      recentWorkOrders: [WorkOrderPreview!]!
      appointmentsThisWeek: [AppointmentsPerDay!]!

      # ✅ Nueva query para frontend
      personalClients: [Client!]!
    }

    type Mutation {
      loginUser(email: String!, password: String!): LoginResponse!

      # Futuras mutaciones:
      # createClient(...): Client!
      # deleteClient(clientId: Int!): Boolean
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
