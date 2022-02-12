interface TileInfo {
  height: number;
  color: string;
  type: "water" | "ground" | "mountain" | "blocked" | "beach";
}
export default function GetTileInfoFromHeight(height: number): TileInfo {
  if (height < -0.8) {
    return { color: "#005c99", height: height, type: "water" };
  } else if (height < -0.5) {
    return { color: "#0099ff", height: height, type: "water" };
  } else if (height < -0.2) {
    return { color: "#ffff00", height: height, type: "beach" };
  } else if (height < 0.2) {
    return { color: "#00ff00", height: height, type: "ground" };
  } else if (height < 0.6) {
    return { color: "#00cc00", height: height, type: "ground" };
  } else if (height < 0.9) {
    return { color: "#595959", height: height, type: "mountain" };
  } else {
    return { color: "#999999", height: height, type: "mountain" };
  }
}
