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
      type: String!
    }

    type Vehicle {
      vehicle_id: Int!
      make: String!
      model: String!
      year: Int!
      license_plate: String!   # ✅ CAMBIADO (antes era plate)
      vin: String!
      client: Client           # ✅ ahora opcional para evitar error si null
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

      personalClients: [Client!]!
      vehicles: [Vehicle!]!
    }

    type Mutation {
      loginUser(email: String!, password: String!): LoginResponse!

      createUser(
        username: String!
        email: String!
        password: String!
        role: String!
      ): User!

      createVehicle(
        client_id: Int!
        make: String!
        model: String!
        year: Int!
        license_plate: String!   # ✅ corregido
        vin: String!
      ): Vehicle!
    }
  `,
  resolvers,
})
