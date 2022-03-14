import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";
import { Config } from "../utils/Config";
import { Player } from "../utils/interfaces";

export const ValidateSession = async (
  client: ApolloClient<NormalizedCacheObject>
) => {
  const query = gql`
    query ValidateSession($relations: [String!]) {
      PlayerLoggedIn(relations: $relations) {
        id
        email
        display_name
        balance
        backgroundURL
        giftedBalance
        hasBlackMarketAccess
        plot {
          id
        }
      }
    }
  `;
  let data = await client.query({
    query: query,
    variables: { relations: ["plot"] },
  });
  console.log(data.data.PlayerLoggedIn);
  return data.data.PlayerLoggedIn;
};
