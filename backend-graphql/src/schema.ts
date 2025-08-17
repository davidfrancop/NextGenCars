// backend-graphql/src/schema.ts

import { createSchema } from "graphql-yoga"
import { resolvers } from "./resolvers"
import type { Context } from "./context"

export const schema = createSchema<Context>({
  typeDefs: /* GraphQL */ `
    enum ClientType {
      PERSONAL
      COMPANY
    }

    type User {
      user_id: Int!
      username: String!
      email: String!
      role: String!
      created_at: String
    }

    type Client {
      client_id: Int!
      # PERSONAL
      first_name: String
      last_name: String
      # COMPANY
      company_name: String
      vat_number: String
      contact_person: String
      # Compartidos
      email: String
      phone: String
      dni: String
      address: String
      country: String
      city: String
      postal_code: String
      type: ClientType!
      created_at: String
      updated_at: String
      vehicles: [Vehicle!]!
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
      updated_at: String
      hsn: String!          # ← NOT NULL en DB
      tsn: String!          # ← NOT NULL en DB
      fuel_type: String!    # ← NOT NULL en DB
      drive: String!        # ← NOT NULL en DB
      transmission: String! # ← NOT NULL en DB
      km: Int!              # ← NOT NULL en DB
      tuv_date: String      # ← DateTime? en DB, expuesto como String ISO
      last_service_date: String # ← DateTime? en DB, expuesto como String ISO
      client: Client
    }

    input CreateClientInput {
      type: ClientType!
      # PERSONAL
      first_name: String
      last_name: String
      # COMPANY
      company_name: String
      vat_number: String
      contact_person: String
      # Compartidos
      email: String
      phone: String
      dni: String
      address: String
      country: String
      city: String
      postal_code: String
    }

    input UpdateClientInput {
      type: ClientType
      # PERSONAL
      first_name: String
      last_name: String
      # COMPANY
      company_name: String
      vat_number: String
      contact_person: String
      # Compartidos
      email: String
      phone: String
      dni: String
      address: String
      country: String
      city: String
      postal_code: String
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
      user(userId: Int!): User
      dashboardStats: DashboardStats!
      recentWorkOrders: [WorkOrderPreview!]!
      appointmentsThisWeek: [AppointmentsPerDay!]!

      # Clients
      clients(
        type: ClientType
        search: String
        take: Int
        skip: Int
      ): [Client!]!
      client(client_id: Int!): Client
      personalClients: [Client!]!  # compat

      # Vehicles
      vehicles: [Vehicle!]!
      vehicle(vehicle_id: Int!): Vehicle
    }

    type Mutation {
      # Auth
      loginUser(email: String!, password: String!): LoginResponse!

      # Users
      createUser(username: String!, email: String!, password: String!, role: String!): User!
      updateUser(userId: Int!, username: String!, email: String!, role: String!, password: String): User!
      deleteUser(userId: Int!): User!

      # Clients
      createClient(data: CreateClientInput!): Client!
      updateClient(client_id: Int!, data: UpdateClientInput!): Client!
      deleteClient(clientId: Int!): Boolean!

      # Vehicles
      createVehicle(
        client_id: Int!
        make: String!
        model: String!
        year: Int!
        license_plate: String!
        vin: String!
        hsn: String!           # ← requeridos
        tsn: String!
        fuel_type: String!
        drive: String!
        transmission: String!
        km: Int!
        # Opcionales nuevos:
        tuv_date: String
        last_service_date: String
      ): Vehicle!

      updateVehicle(
        vehicle_id: Int!
        make: String
        model: String
        year: Int
        # Aceptamos ambos alias por compatibilidad:
        license_plate: String
        plate: String
        vin: String
        hsn: String
        tsn: String
        fuel_type: String
        drive: String
        transmission: String
        km: Int
        # Opcionales nuevos:
        tuv_date: String
        last_service_date: String
      ): Vehicle!

      deleteVehicle(vehicleId: Int!): Boolean!
    }
  `,
  resolvers,
})
