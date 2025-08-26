// control/src/apollo/client.ts

import { ApolloClient, InMemoryCache, from, HttpLink } from "@apollo/client"
import { onError } from "@apollo/client/link/error"
import { setContext } from "@apollo/client/link/context"
import { getToken } from "@/utils/token"   // ✅ usa TOKEN_KEY = "nextgencars_token"

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_API_URL, // ej: "http://localhost:4000/graphql"
})

const authLink = setContext((_, { headers }) => {
  const token = getToken()
  // 👇 LOG para verificar qué token se está leyendo
  console.log("[Apollo authLink] token:", token)

  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
})

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors?.length) {
    console.error(`[GraphQL @ ${operation.operationName}]`, graphQLErrors)
    console.error("Query:", operation.query?.loc?.source.body)
    console.error("Vars:", operation.variables)
  }
  if (networkError) {
    console.error("[NetworkError]", networkError)
  }
})

export default new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
})
