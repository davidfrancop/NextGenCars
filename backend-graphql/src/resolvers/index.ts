// backend-graphql/src/resolvers/index.ts

import { vehicleResolvers } from "./vehicles"
import { clientsResolvers } from "./clients"
import { dashboardResolvers } from "./dashboard"
import { userResolvers } from "./users"

type ResolverMap = {
  [typeName: string]: { [field: string]: any }
}

const modules: Array<Partial<ResolverMap>> = [
  vehicleResolvers,
  clientsResolvers,
  dashboardResolvers,
  userResolvers,
]

// 🔧 Une por nombre de tipo: Query, Mutation, Client, Vehicle, etc.
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
    Query: {
      hello: () => "Hello from NextGen Cars GraphQL backend",
    },
    Mutation: {},
  }
)

export default resolvers
