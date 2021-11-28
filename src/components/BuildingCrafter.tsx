import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import { useEffect, useState } from "react";
import { Button, Card, Form, Table } from "react-bootstrap";
import { emitCustomEvent, useCustomEventListener } from "react-custom-events";
import Draggable from "react-draggable";
import { toast } from "react-toastify";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import { Building, InventoryItem } from "../utils/interfaces";
import WindowHeader from "./WindowHeader";
export default function BuildingCrafter(props: {
  isOpen: boolean;
  onClose: Function;
  onFocus: (windowType: WindowTypes) => void;
  className: string;
}) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building>();
  const [isCraftable, setIsCraftable] = useState<boolean>(false);
  const client = useApolloClient();

  const craftItem = (BuildingId: number) => {
    // Hämta inventory data om vad vi har för sak
    // Vi vill joina ett rum med den item:en i.
    const mutation = gql`
      mutation main($Building: Int!) {
        CraftBuilding(data: { Building: $Building }) {
          id
          amount
        }
      }
    `;
    client
      .mutate({
        mutation: mutation,
        variables: {
          Building: BuildingId,
        },
      })
      .then((res) => {
        if (res.data) {
          fetchBuildings();
          emitCustomEvent("inventoryUpdate");
          toast.success("Successfully built item!", { autoClose: 5000 });

          console.dir(res);
        } else {
          toast.error("Something went wrong with building the item...", {
            autoClose: 5000,
          });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const fetchBuildings = async () => {
    const query = gql`
      query main {
        Building {
          id
          outputItem {
            id
            name
            price
            market_name
          }
          output_amount
          recipe {
            id
            item {
              id
              name
            }
            amount
          }
          name
          total_amount_placed
        }
        PlayerLoggedIn {
          inventory {
            id
            amount
            item {
              id
              name
            }
          }
        }
      }
    `;

    let data = await client.query({
      query: query,
    });
    setBuildings(data.data.Building);
    setInventory(data.data.PlayerLoggedIn.inventory);
    console.dir(data);
  };
  useCustomEventListener("inventoryUpdate", async (data) => {
    // När plot data har uppdaterats så ska vi hämta datan igen
    fetchBuildings();
  });
  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (selectedBuilding?.recipe && selectedBuilding?.recipe.length !== 0) {
      let isCraftable = true;

      // FIXA Detta, det ska vara tvärt om.

      for (let i = 0; i < selectedBuilding.recipe.length; i++) {
        const item = selectedBuilding.recipe[i].item;
        if (!inventory.find((i) => i.item && i.item.id === item.id))
          isCraftable = false;
      }
      setIsCraftable(isCraftable);
    } else setIsCraftable(false);
  }, [selectedBuilding]);
  return (
    <Draggable
      axis="both"
      handle=".handle"
      defaultPosition={{ x: 40, y: 10 }}
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("buildingCrafter")}
    >
      <Card
        style={{ width: 800, ...HideStyle(!props.isOpen), display: "flex" }}
      >
        <WindowHeader
          title="Building Crafter"
          onClose={() => props.onClose()}
        />
        <div
          style={{
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            flexDirection: "row",
          }}
        >
          <Card style={{ minWidth: "50%", flex: 1, minHeight: 180 }}>
            <Card.Body>
              <Card.Title>Overview</Card.Title>
              <Form.Control
                as="select"
                size="sm"
                onChange={(e) =>
                  setSelectedBuilding(
                    buildings.find((b) => b.id === Number(e.target.value!))
                  )
                }
              >
                <option>Select building</option>
                {buildings &&
                  buildings.map((b) => {
                    if (!b.name) return null;
                    else
                      return (
                        <option key={b.id} value={b.id}>
                          {b.name} (
                          {b.recipe.map((r, index) =>
                            index === 0
                              ? "Recipe: " + r.item.name
                              : ", " + r.item.name
                          )}
                          )
                        </option>
                      );
                  })}
              </Form.Control>
              {selectedBuilding ? (
                <div>
                  <p>
                    Output:{" "}
                    {selectedBuilding.outputItem
                      ? selectedBuilding.output_amount +
                        "x " +
                        selectedBuilding.outputItem.name
                      : "$" + selectedBuilding.output_amount}{" "}
                    / 10 min
                  </p>
                  <p>Total active: {selectedBuilding.total_amount_placed}</p>
                </div>
              ) : null}
            </Card.Body>
          </Card>
          <Card style={{ minWidth: "50%", flex: 1, minHeight: 180 }}>
            <Card.Body>
              <Card.Title>Recipe</Card.Title>
              {selectedBuilding ? (
                <>
                  <Table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style={{ textAlign: "right" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBuilding.recipe.map((r) => {
                        const amount =
                          inventory.find(
                            (i) => i.item && i.item.id === r.item.id
                          )?.amount || 0;
                        return (
                          <tr key={r.id}>
                            <td>{r.item.name}</td>
                            <td
                              style={{
                                textAlign: "right",
                                color: amount < r.amount ? "red" : "green",
                              }}
                            >
                              {amount} / {r.amount}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                  <Button
                    size="sm"
                    style={{ float: "right" }}
                    disabled={!isCraftable}
                    onClick={() => craftItem(selectedBuilding.id)}
                  >
                    Craft
                  </Button>
                </>
              ) : (
                <p>
                  <em>Please select a building.</em>
                </p>
              )}
            </Card.Body>
          </Card>
        </div>
      </Card>
    </Draggable>
  );
}
