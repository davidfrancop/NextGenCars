// control/src/apollo/client.ts

import { ApolloClient, InMemoryCache, from, HttpLink } from "@apollo/client"
import { onError } from "@apollo/client/link/error"

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    console.error(`[GraphQL @ ${operation.operationName}]`, graphQLErrors)
    console.error("Query:", operation.query?.loc?.source.body)
    console.error("Vars:", operation.variables)
  }
  if (networkError) console.error("[Network]", networkError)
})

export default new ApolloClient({
  link: from([errorLink, new HttpLink({ uri: import.meta.env.VITE_API_URL })]),
  cache: new InMemoryCache(),
})
