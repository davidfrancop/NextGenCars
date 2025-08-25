// backend-graphql/src/schema.ts

import { createSchema } from "graphql-yoga"
import { resolvers } from "./resolvers"
import type { Context } from "./context"

export const schema = createSchema<Context>({
  typeDefs: /* GraphQL */ `
    scalar DateTime
    scalar Date
    scalar JSON

    enum ClientType {
      PERSONAL
      COMPANY
    }

    # -------- Users --------
    type User {
      user_id: Int!
      username: String!
      email: String!
      role: String!
      created_at: DateTime
    }

    # -------- Clients --------
    type Client {
      client_id: Int!
      # PERSONAL
      first_name: String
      last_name: String
      # COMPANY
      company_name: String
      vat_number: String
      contact_person: String
      # Shared
      email: String
      phone: String
      dni: String
      address: String
      country: String
      city: String
      postal_code: String
      type: ClientType!
      created_at: DateTime
      updated_at: DateTime
      vehicles: [Vehicle!]!
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
      # Shared
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
      # Shared
      email: String
      phone: String
      dni: String
      address: String
      country: String
      city: String
      postal_code: String
    }

    # -------- Vehicles --------
    type Vehicle {
      vehicle_id: Int!
      client_id: Int!
      make: String!
      model: String!
      year: Int!
      license_plate: String!
      vin: String!
      created_at: DateTime
      updated_at: DateTime
      hsn: String!
      tsn: String!
      fuel_type: String!
      drive: String!
      transmission: String!
      km: Int!
      tuv_date: Date
      last_service_date: Date
      client: Client
    }

    # -------- Dashboard --------
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
      createdAt: DateTime!
      status: String!
    }

    type AppointmentsPerDay {
      day: String!
      count: Int!
    }

    type LoginResponse {
      token: String!
    }

    # ========= Work Orders (SDL) =========

    enum WorkOrderStatus { OPEN IN_PROGRESS ON_HOLD CLOSED CANCELED }
    enum WorkOrderPriority { LOW MEDIUM HIGH URGENT }

    type WorkOrder {
      work_order_id: Int!
      client_id: Int!
      vehicle_id: Int!
      assigned_user_id: Int
      title: String!
      description: String
      status: WorkOrderStatus!
      priority: WorkOrderPriority!
      scheduled_start: DateTime
      scheduled_end: DateTime
      start_date: DateTime
      end_date: DateTime
      km_at_service: Int
      estimated_cost: Float
      total_cost: Float
      tasks: JSON
      created_at: DateTime!
      updated_at: DateTime!

      client: Client!
      vehicle: Vehicle!
      assigned_user: User
    }

    input WorkOrderFilter {
      status: WorkOrderStatus
      client_id: Int
      vehicle_id: Int
      assigned_user_id: Int
      from: DateTime
      to: DateTime
      search: String
      q: String            # 👈 añadido para que el frontend pueda mandar filter.q
    }

    input WorkOrderCreateInput {
      client_id: Int!
      vehicle_id: Int!
      title: String!
      description: String
      status: WorkOrderStatus = OPEN
      priority: WorkOrderPriority = MEDIUM
      scheduled_start: DateTime
      scheduled_end: DateTime
      start_date: DateTime
      end_date: DateTime
      km_at_service: Int
      estimated_cost: Float
      total_cost: Float
      tasks: JSON
      assigned_user_id: Int
    }

    input WorkOrderUpdateInput {
      client_id: Int
      vehicle_id: Int
      title: String
      description: String
      status: WorkOrderStatus
      priority: WorkOrderPriority
      scheduled_start: DateTime
      scheduled_end: DateTime
      start_date: DateTime
      end_date: DateTime
      km_at_service: Int
      estimated_cost: Float
      total_cost: Float
      tasks: JSON
      assigned_user_id: Int
    }

    type WorkOrderConnection {
      items: [WorkOrder!]!
      total: Int!
    }

    # ========= Root Types =========
    type Query {
      hello: String!
      users: [User!]!
      user(userId: Int!): User
      dashboardStats: DashboardStats!
      recentWorkOrders: [WorkOrderPreview!]!
      appointmentsThisWeek: [AppointmentsPerDay!]!

      # Clients
      clients(type: ClientType, search: String, take: Int, skip: Int): [Client!]!
      client(client_id: Int!): Client
      personalClients: [Client!]!

      # Vehicles
      vehicles: [Vehicle!]!
      vehicle(vehicle_id: Int!): Vehicle

      # Work Orders
      workOrder(work_order_id: Int!): WorkOrder
      workOrders(filter: WorkOrderFilter, skip: Int = 0, take: Int = 25): WorkOrderConnection!
      workOrdersRevenue(from: DateTime, to: DateTime): Float!
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
        hsn: String!
        tsn: String!
        fuel_type: String!
        drive: String!
        transmission: String!
        km: Int!
        tuv_date: Date
        last_service_date: Date
      ): Vehicle!

      updateVehicle(
        vehicle_id: Int!
        client_id: Int           # allow re-assigning the vehicle to another client
        make: String
        model: String
        year: Int
        # compatibility alias:
        license_plate: String
        plate: String
        vin: String
        hsn: String
        tsn: String
        fuel_type: String
        drive: String
        transmission: String
        km: Int
        tuv_date: Date
        last_service_date: Date
      ): Vehicle!

      deleteVehicle(vehicleId: Int!): Boolean!

      # Work Orders
      createWorkOrder(input: WorkOrderCreateInput!): WorkOrder!
      updateWorkOrder(work_order_id: Int!, input: WorkOrderUpdateInput!): WorkOrder!
      deleteWorkOrder(work_order_id: Int!): Boolean!
    }
  `,
  resolvers,
})