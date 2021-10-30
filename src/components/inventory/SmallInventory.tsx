import React, { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../../context/PlayerContext";
import { InventoryItem } from "../../utils/interfaces";
export default function NewBuildingModal(props: { onSelect: Function }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const getPlayer = useContext(PlayerContext);
  useEffect(() => {
    if (getPlayer.inventory) {
      setInventory(getPlayer.inventory || []);
    }
  }, [getPlayer]);
  return (
    <>
      {inventory.map((i) => {
        <p key={i.id}>{i.item.market_name}</p>;
      })}
    </>
  );
}
