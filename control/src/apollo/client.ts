// control/src/apollo/client.ts

import { ApolloClient, InMemoryCache, from, HttpLink } from "@apollo/client"
import { onError } from "@apollo/client/link/error"
import { setContext } from "@apollo/client/link/context"

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_API_URL, // ej: "http://localhost:4000/graphql"
})

// Lee el token y lo manda en el header Authorization
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token") || ""
  return {
    headers: {
      ...headers,
      // Si no hay token, NO envía Authorization (evita "Bearer " vacío)
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
})

// Logs útiles para depurar
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