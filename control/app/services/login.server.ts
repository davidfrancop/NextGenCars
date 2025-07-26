// control/app/services/login.server.ts
import { gql } from "graphql-request";
import { getGraphQLClient } from "~/lib/graphql";

const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
    }
  }
`;

export async function loginUser(email: string, password: string) {
  const client = getGraphQLClient();
  const variables = { email, password };

  const data = await client.request(LOGIN_USER, variables);
  return data.loginUser;
}
