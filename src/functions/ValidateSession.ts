import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";
import { Config } from "../utils/Config";
import { Player } from "../utils/interfaces";

export const ValidateSession = async (
  client: ApolloClient<NormalizedCacheObject>
) => {
  const query = gql`
    query {
      PlayerLoggedIn {
        email
        display_name
        balance
      }
    }
  `;
  let data = await client.query({
    query: query,
  });
  console.log(data.data.PlayerLoggedIn);
  return data.data.PlayerLoggedIn;
};
