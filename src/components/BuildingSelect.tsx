import { gql, useApolloClient } from "@apollo/client";
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useCustomEventListener } from "react-custom-events";
import { Building, InventoryItem } from "../utils/interfaces";
export default function BuildingSelect(props: {
  onSelect: (id: number) => void;
  placedBuildingTypes?: string[];
}) {
  const client = useApolloClient();
  const [buildings, setBuildings] = useState<InventoryItem[]>([]);
  const [selected, setSelected] = useState<number>();
  const loadBuildings = async () => {
    const query = gql`
      query {
        PlayerLoggedIn {
          display_name
          inventory {
            id
            amount
            building {
              name
              id
            }
          }
        }
      }
    `;

    let data = await client.query({
      query: query,
    });
    setBuildings(data.data.PlayerLoggedIn.inventory);
  };
  useEffect(() => {
    loadBuildings();
  }, []);
  useCustomEventListener("inventoryUpdate", async (data) => {
    // När plot data har uppdaterats så ska vi hämta datan igen
    loadBuildings();
  }); // Array.from https://stackoverflow.com/a/64709518
  return (
    <div>
      <Form.Control
        as="select"
        size="sm"
        onChange={(e) => setSelected(Number(e.target.value!))}
      >
        <option>Select building</option>
        {props.placedBuildingTypes && props.placedBuildingTypes.length === 2
          ? buildings
              ?.filter(
                (b) =>
                  b.building &&
                  props.placedBuildingTypes?.includes(b.building.name)
              )
              .map((b) => {
                if (!b.building) return null;
                else
                  return (
                    <option key={b.id} value={b.id}>
                      {b.building?.name} ({b.amount})
                    </option>
                  );
              })
          : buildings?.map((b) => {
              if (!b.building) return null;
              else
                return (
                  <option key={b.id} value={b.id}>
                    {b.building?.name} ({b.amount})
                  </option>
                );
            })}
      </Form.Control>
      <Button
        size="sm"
        disabled={!selected}
        style={{ float: "right", marginTop: 5 }}
        onClick={() => props.onSelect(selected!)}
      >
        Add building
      </Button>
    </div>
  );
}
