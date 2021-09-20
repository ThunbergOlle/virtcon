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
          highest_bid
          is_owned
          created
          max_tiles
          total_revenue_generated
          raw_material_available
          buildings {
            generatesPerHour
            material_name
            hacked
            upgrades
            consumes
            consumesPerHour
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
