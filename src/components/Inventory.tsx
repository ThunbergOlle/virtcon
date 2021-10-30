import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useEffect, useState } from "react";
import { Button, Card, ListGroup, Table } from "react-bootstrap";
import { useCustomEventListener } from "react-custom-events";
import Draggable from "react-draggable";
import { HideStyle } from "../utils/HideStyle";
import { InventoryItem, Item } from "../utils/interfaces";
import WindowHeader from "./WindowHeader";
export default function Inventory(props: { isOpen: boolean }) {
  const [hideContent, setHideContent] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const client = useApolloClient();

  const fetchInventoryData = async () => {
    const query = gql`
      query {
        PlayerLoggedIn {
          display_name
          inventory {
            id
            item {
              name
              rarity
              type
            }
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
    console.dir(data);
    setInventory(data.data.PlayerLoggedIn.inventory);
  };
  useCustomEventListener("inventoryUpdate", async (data) => {
    // När inventoryt har uppdaterats så ska vi hämta datan igen
    fetchInventoryData();
  });
  useEffect(() => {
    fetchInventoryData();
  }, []);

  return (
    <Draggable axis="both" handle=".handle" defaultPosition={{ x: 40, y: 10 }}>
      <Card style={{ width: 800, ...HideStyle(!props.isOpen) }}>
        <WindowHeader
          title="Inventory"
          onChange={(hide: boolean) => setHideContent(hide)}
        />

        <Table hover style={HideStyle(hideContent)}>
          <thead>
            <th>Icon</th>
            <th>Name</th>
            <th>Type</th>
            <th>Rarity</th>
            <th>Amount</th>
            <th>Action</th>
          </thead>
          <tbody>
            {inventory?.map((i) => {
              //Avgör om det är en byggnad eller en sak.

              if (i.building) {
                return (
                  <tr id={String(i.id)} key={i.id}>
                    <td>
                      <img src={`./icons/${i.building.name}.png`} height="25" />
                    </td>
                    <td>{i.building.name}</td>
                    <td>Building</td>
                    <td>-</td>
                    <td>{i.amount}</td>
                    <td>
                      <Button
                        size="sm"
                        style={{
                          height: 22,
                          margin: 0,
                          padding: 0,
                          width: "100%",
                        }}
                      >
                        Place
                      </Button>
                    </td>
                  </tr>
                );
              } else if (i.item !== null) {
                return (
                  <tr id={String(i.id)} key={i.id}>
                    <td>
                      <img
                        src={`./icons/${i.item.market_name}.png`}
                        height="25"
                      />
                    </td>
                    <td>{i.item.name}</td>
                    <td>{i.item.type}</td>
                    <td>{i.item.rarity}</td>
                    <td>{i.amount}</td>
                    <td>
                      <Button
                        size="sm"
                        style={{
                          height: 22,
                          margin: 0,
                          padding: 0,
                          width: "100%",
                        }}
                        disabled={i.item.type === "currency"}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              } else return null;
            })}
          </tbody>
        </Table>
      </Card>
    </Draggable>
  );
}
