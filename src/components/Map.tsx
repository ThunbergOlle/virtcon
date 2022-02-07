import React, { useEffect, useState } from "react";
import { PlotGrid } from "../utils/interfaces";

function GetBackgroundColorOfTile(height: number): string {
  if (height < -0.8) {
    return "#005c99";
  } else if (height < -0.5) {
    return "#0099ff";
  } else if (height < -0) {
    return "#ffff00";
  } else if (height < 0.2) {
    return "#00ff00";
  } else if (height < 0.6) {
    return "#00cc00";
  } else if (height < 0.9) {
    return "#595959";
  } else {
    return "#999999";
  }
}
export default function Map(props: {
  width: number;
  rowSize: number;
  grid: PlotGrid[];
  height?: number;
  onTileClicked: (tile: PlotGrid) => void;
}) {
  const [rendableGrid, setRendableGrid] = useState<JSX.Element[]>([]);
  const [highlightedTile, setHiglightedTile] = useState<PlotGrid>();
  const onTileClicked = (tile: PlotGrid) => {
    setHiglightedTile(tile);
    props.onTileClicked(tile);
    load(tile);
  };
  const load = (highlightedTile?: PlotGrid) => {
    const _rendableGrid: JSX.Element[] = [];
    for (let i = 0; i < props.grid.length; i++) {
      const currentBuilding = props.grid[i].building?.building;
      _rendableGrid.push(
        <div
          onClick={() => onTileClicked(props.grid[i])}
          style={{
            backgroundColor: props.grid[i].building
              ? "gray"
              : GetBackgroundColorOfTile(props.grid[i].height),
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
        maxWidth: props.width * props.rowSize,
        maxHeight: (props.height || props.width) * props.rowSize,
      }}
    >
      {rendableGrid}
    </div>
  );
}
