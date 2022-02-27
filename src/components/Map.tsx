import React, { useEffect, useState } from "react";
import GetTileInfoFromHeight from "../functions/GetTileInfoFromHeight";
import { PlotGrid } from "../utils/interfaces";

export default function Map(props: {
  width: number;
  rowSize: number;
  grid: PlotGrid[];
  height?: number;
  plotId?: number;
  onTileClicked?: (tile: PlotGrid) => void;
  onMapClicked?: (plotId: number) => void;
}) {
  const [rendableGrid, setRendableGrid] = useState<JSX.Element[]>([]);
  const [highlightedTile, setHiglightedTile] = useState<PlotGrid>();
  const onTileClicked = (tile: PlotGrid) => {
    setHiglightedTile(tile);
    props.onTileClicked!(tile);
    load(tile);
  };
  const load = (highlightedTile?: PlotGrid) => {
    const _rendableGrid: JSX.Element[] = [];
    for (let i = 0; i < props.grid.length; i++) {
      const currentBuilding = props.grid[i].building?.building;
      _rendableGrid.push(
        <div
          onClick={() => {
            if (props.onTileClicked) onTileClicked(props.grid[i]);
          }}
          style={{
            backgroundColor: props.grid[i].building
              ? "silver"
              : GetTileInfoFromHeight(props.grid[i].height).color,
            flex: `1 0 ${
              props.rowSize ? 100 / (props.rowSize + 1) + 1 : 21 // Algoritm för att räkna ut hur stor flex jag behöver ha. https://stackoverflow.com/a/45384426
            }%`,
            minWidth: props.width,
            minHeight: props.height || props.width,
            backgroundImage: `url("icons/${
              currentBuilding?.outputItem?.market_name ||
              (currentBuilding?.output_amount &&
                !currentBuilding.electricityGenerated &&
                "money") ||
              props.grid[i].resource?.resource.market_name
            }.png")`,
            backgroundSize: props.width - 10,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            borderWidth: highlightedTile === props.grid[i] ? 4 : 0,
            borderStyle: "solid",
            borderColor:
              highlightedTile === props.grid[i] ? "lightblue" : "darkgrey",
            cursor: "pointer",
            position: "relative",
          }}
        ></div>
      );
    }
    setRendableGrid(_rendableGrid);
  };
  useEffect(() => {
    load();
  }, [props.grid]);
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "row",
        width: props.width * props.rowSize,
        height: (props.height || props.width) * props.rowSize,
      }}
      onClick={() =>
        props.onMapClicked ? props.onMapClicked(props.plotId!) : undefined
      }
    >
      {rendableGrid}
    </div>
  );
}
