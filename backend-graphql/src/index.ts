import { createServer } from 'node:http'
import { createYoga } from 'graphql-yoga'
import { schema } from './schema'
import { context } from './context'

const yoga = createYoga({ schema, context })
const server = createServer(yoga)

server.listen(4000, '0.0.0.0', () => {
  console.log('🚀 GraphQL server ready at http://192.168.178.36:4000/graphql')
})
