// backend-graphql/src/resolvers/index.ts

import { GraphQLDateTime, GraphQLDate, GraphQLJSON } from "graphql-scalars" // 👈 añade GraphQLJSON
import { vehicleResolvers } from "./vehicles"
import { clientsResolvers } from "./clients"
import { dashboardResolvers } from "./dashboard"
import { userResolvers } from "./users"
import { WorkOrdersResolvers } from "./work_orders"

type ResolverMap = {
  [typeName: string]: { [field: string]: any }
}

const modules: Array<Partial<ResolverMap>> = [
  vehicleResolvers,
  clientsResolvers,
  dashboardResolvers,
  userResolvers,
  WorkOrdersResolvers, // 👈 Work Orders
]

// 🔧 Une por nombre de tipo: Query, Mutation, Client, Vehicle, WorkOrder, etc.
function mergeResolvers(acc: ResolverMap, mod?: Partial<ResolverMap>): ResolverMap {
  if (!mod) return acc
  for (const typeName of Object.keys(mod)) {
    const fields = (mod as any)[typeName]
    if (!fields) continue
    acc[typeName] = { ...(acc[typeName] ?? {}), ...fields }
  }
  return acc
}

export const resolvers: ResolverMap = modules.reduce(
  mergeResolvers,
  {
    // 👇 Registro de escalares para tu schema.ts
    DateTime: GraphQLDateTime,
    Date: GraphQLDate,
    JSON: GraphQLJSON, // 👈 registra el scalar JSON

    Query: {
      hello: () => "Hello from NextGen Cars GraphQL backend",
    },
    Mutation: {},
  }
)

export default resolvers
