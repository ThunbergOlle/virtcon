import { useEffect } from "react";
import { Card } from "react-bootstrap";
import { InventoryItem } from "../utils/interfaces";
export default function SelectBuildingModal(props: {
  isOpen: boolean;
  onSelect: Function;
  inventory: InventoryItem;
}) {
  useEffect(() => {
    //Laddda de byggnader som finns i inventoriet.
  }, []);
  if (props.isOpen) {
    return (
      <Card>
        <p>Test</p>
      </Card>
    );
  } else return <></>;
}
