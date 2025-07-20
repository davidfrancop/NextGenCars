import { createSchema } from 'graphql-yoga'
import { resolvers } from './resolvers'

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      hello: String!
    }
  `,
  resolvers
})
