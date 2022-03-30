import { gql } from "@apollo/client";
import { emitCustomEvent } from "react-custom-events";
import { toast } from "react-toastify";
import { client } from "../App";

export const BuildingAddToPlot = async (
  buildingId: number,
  plotId: number,
  tileId: number
) => {
  try {
    const query = gql`
      mutation BuildingAddToPlot(
        $buildingId: Int!
        $plotId: Int!
        $tileId: Int!
      ) {
        BuildingAddToPlot(
          InventoryBuildingId: $buildingId
          PlotId: $plotId
          TileId: $tileId
        ) {
          id
        }
      }
    `;
    await client.query({
      query: query,
      variables: { buildingId: buildingId, plotId: plotId, tileId: tileId },
    });
    // Reloada all data
    emitCustomEvent("inventoryUpdate");
    emitCustomEvent("plotUpdate");
    emitCustomEvent("selectedPlotUpdate");
    emitCustomEvent("productionOverviewUpdate");
    emitCustomEvent("backgroundUpdate");
    emitCustomEvent("buildingOverviewUpdate");
  } catch (e: any) {
    toast.error(String(e.message), { autoClose: 3000 });
  }
};
