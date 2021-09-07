import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";
import { Config } from "../utils/Config";
import { IntrPlayer } from "../utils/interfaces";

export const ValidateSession = async (
  client: ApolloClient<NormalizedCacheObject>
) => {
  const query = gql`
    query {
      CurrentUser {
        email
        display_name
        balance
        plots {
          _id
          created
          buildings {
            perHour
            material_name
            hacked
            upgrades
          }
        }
        inventory {
          item
          amount
        }
      }
    }
  `;
  let data = await client.query({
    query: query,
  });

  return data.data.CurrentUser;
};
