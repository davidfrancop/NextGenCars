import { vehicleResolvers } from "./vehicles";
import { clientsResolvers } from "./clients";
import { dashboardResolvers } from "./dashboard";
import { userResolvers } from "./users";

export const resolvers = {
  Query: {
    ...vehicleResolvers.Query,
    ...clientsResolvers.Query,
    ...dashboardResolvers.Query,
    ...userResolvers.Query,
    hello: () => "Hello from NextGen Cars GraphQL backend",
  },
  Mutation: {
    ...vehicleResolvers.Mutation,
    ...clientsResolvers.Mutation,
    ...dashboardResolvers.Mutation,
    ...userResolvers.Mutation,
  },
};
