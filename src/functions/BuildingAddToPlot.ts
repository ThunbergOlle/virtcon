import { gql } from "@apollo/client";
import { emitCustomEvent } from "react-custom-events";
import { toast } from "react-toastify";
import { client } from "../App";
import { Plot } from "../utils/interfaces";

export const BuildingAddToPlot = async (buildingId: number, plotId: number) => {
  try {
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
    emitCustomEvent("productionOverviewUpdate");
  } catch (e: any) {
    toast.error(String(e.message), { autoClose: 3000 });
  }
};
