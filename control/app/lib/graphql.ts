// control/app/lib/graphql.ts
import { GraphQLClient } from "graphql-request";

const API_URL = process.env.NEXTGEN_GRAPHQL_API || "http://localhost:4000/graphql";

// Esta función se usa desde acciones o loaders
export function getGraphQLClient(token?: string) {
  return new GraphQLClient(API_URL, {
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
  });
}
