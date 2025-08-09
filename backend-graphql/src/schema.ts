// backend-graphql/src/schema.ts
import { createSchema } from "graphql-yoga"
import { resolvers } from "./resolvers"
import type { Context } from "./context"

export const schema = createSchema<Context>({
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
      type: String
      created_at: String
    }

    type Vehicle {
      vehicle_id: Int!
      client_id: Int!
      make: String!
      model: String!
      year: Int!
      license_plate: String!
      vin: String!
      created_at: String
      hsn: String
      tsn: String
      fuel_type: String
      drive: String
      transmission: String
      km: Int
      client: Client # ✅ relación con Client
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

    type LoginResponse {
      token: String!
    }

    type Query {
      hello: String!
      users: [User!]!
      dashboardStats: DashboardStats!
      recentWorkOrders: [WorkOrderPreview!]!
      appointmentsThisWeek: [AppointmentsPerDay!]!

      # Clients
      personalClients: [Client!]!
      clients: [Client!]!
      client(client_id: Int!): Client

      # Vehicles
      vehicles: [Vehicle!]!
    }

    type Mutation {
      # Auth
      loginUser(email: String!, password: String!): LoginResponse!

      # Users
      createUser(
        username: String!
        email: String!
        password: String!
        role: String!
      ): User!

      # Clients
      createClient(
        first_name: String!
        last_name: String!
        email: String
        phone: String
        country: String
        type: String!
      ): Client!

      updateClient(
        client_id: Int!
        first_name: String
        last_name: String
        email: String
        phone: String
        country: String
        type: String
      ): Client!

      deleteClient(clientId: Int!): Boolean!

      # Vehicles
      createVehicle(
        client_id: Int!
        make: String!
        model: String!
        year: Int!
        license_plate: String!
        vin: String!
        hsn: String
        tsn: String
        fuel_type: String
        drive: String
        transmission: String
        km: Int
      ): Vehicle!

      deleteVehicle(vehicleId: Int!): Boolean!
    }
  `,
  resolvers,
})
