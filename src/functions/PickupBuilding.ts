import { gql } from "@apollo/client";
import { emitCustomEvent } from "react-custom-events";
import { client } from "../App";

export const pickupBuilding = async (buildingId: number) => {
  const query = gql`
    mutation pickupBuilding($buildingId: Int!) {
      PlotBuildingPickup(PlotBuildingId: $buildingId) {
        id
      }
    }
  `;
  let data = await client.query({
    query: query,
    variables: { buildingId: buildingId },
  });
  // Reloada all data
  emitCustomEvent("inventoryUpdate");
  emitCustomEvent("plotUpdate");
  emitCustomEvent("buildingOverviewUpdate");
};
