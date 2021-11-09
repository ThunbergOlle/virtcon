import { gql } from "@apollo/client";
import { emitCustomEvent } from "react-custom-events";
import { client } from "../App";
import { Plot } from "../utils/interfaces";

export const BuildingAddToPlot = async (buildingId: number, plotId: number) => {
  const query = gql`
    mutation main($buildingId: Int!, $plotId: Int!) {
      BuildingAddToPlot(InventoryBuildingId: $buildingId, PlotId: $plotId) {
        id
      }
    }
  `;
  let data = await client.query({
    query: query,
    variables: { buildingId: buildingId, plotId: plotId },
  });
  // Reloada all data
  emitCustomEvent("inventoryUpdate");
  emitCustomEvent("plotUpdate");
  emitCustomEvent("selectedPlotUpdate");
};
