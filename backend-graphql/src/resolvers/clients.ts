// backend-graphql/src/resolvers/clients.ts
export const clientsResolvers = {
  Query: {
    personalClients: async (_parent, _args, ctx) => {
      return ctx.prisma.client.findMany({
        where: { type: "personal" },
      })
    },
  },
}
