import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import { useEffect, useState } from "react";
import { Button, Card, Form, Table } from "react-bootstrap";
import { emitCustomEvent, useCustomEventListener } from "react-custom-events";
import Draggable from "react-draggable";
import { toast } from "react-toastify";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import { Building, InventoryItem, Item } from "../utils/interfaces";
import WindowHeader from "./WindowHeader";

export default function BuildingCrafter(props: {
  isOpen: boolean;
  onClose: Function;
  onFocus: (windowType: WindowTypes) => void;
  className: string;
}) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building>();
  const [electricalPrice, setElectricalPrice] = useState<number>();
  const [isCraftable, setIsCraftable] = useState<boolean>(false);
  const [nameFilter, setNameFilter] = useState<string>("");

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
          load();
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

  const load = async (outputItemId?: number) => {
    const query = gql`
      query main($outputItemId: Int) {
        Building(filter: { outputItem: $outputItemId }) {
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
          consumes_items {
            item {
              name
              market_name
            }
            id
            amount
          }
          name
          total_amount_placed
          electricityUsed
          electricityGenerated
        }
        Item {
          name
          market_name
          spawn_rate
          type
          id
          rarity
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
        ServerShopPrices(playerId: 7, name: "Electricity") {
          name
          price
        }
      }
    `;

    let data = await client.query({
      query: query,
      variables: { outputItemId: outputItemId },
    });
    setBuildings(data.data.Building);
    setInventory(data.data.PlayerLoggedIn.inventory);
    setItems(data.data.Item);
    setElectricalPrice(data.data.ServerShopPrices[0].price);
    setSelectedBuilding(data.data.Building[0]);
  };
  const selectBuilding = (selectedBuilding?: Building) => {
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
  };
  useCustomEventListener("inventoryUpdate", async (data) => {
    // När plot data har uppdaterats så ska vi hämta datan igen
    load();
  });
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    selectBuilding(selectedBuilding);
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
          <Card style={{ minWidth: "100%", flex: 1, minHeight: 180 }}>
            <Card.Body>
              <Card.Title>Find building</Card.Title>
              <Form.Group>
                <Form.Label>Item name</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  onChange={(e) => setNameFilter(e.target.value.toUpperCase())}
                ></Form.Control>
                <Form.Text className="text-muted">
                  Search and select the item you want to produce
                </Form.Text>
              </Form.Group>
              <div
                style={{
                  overflowY: "scroll",
                  display: "flex",
                  flexDirection: "column",
                  height: 150,
                  marginLeft: 5,
                }}
              >
                <Table hover>
                  <thead>
                    <th>Icon</th>
                    <th>Name</th>
                  </thead>
                  <tbody>
                    {"electricity".toUpperCase().includes(nameFilter) ? (
                      <tr
                        style={{ cursor: "pointer" }}
                        onClick={() => load(-2)}
                      >
                        <td>
                          <img src={`./icons/electricity.png`} height="25" />
                        </td>
                        <td>Electricity</td>
                      </tr>
                    ) : null}
                    {"money".toUpperCase().includes(nameFilter) ? (
                      <tr
                        style={{ cursor: "pointer" }}
                        onClick={() => load(-3)}
                      >
                        <td>
                          <img src={`./icons/money.png`} height="25" />
                        </td>
                        <td>Money</td>
                      </tr>
                    ) : null}
                    {items.map((i) =>
                      i.name.toUpperCase().includes(nameFilter) ? (
                        <tr
                          id={String(i.id)}
                          key={i.id}
                          style={{ cursor: "pointer" }}
                          onClick={() => load(i.id)}
                        >
                          <td>
                            <img
                              src={`./icons/${i.market_name}.png`}
                              height="25"
                            />
                          </td>
                          <td>{i.name}</td>
                        </tr>
                      ) : null
                    )}
                  </tbody>
                </Table>
              </div>

              <Form.Group style={{ marginTop: 10 }}>
                <Form.Label>Building name</Form.Label>
                <Form.Control
                  as="select"
                  size="sm"
                  value={selectedBuilding?.id || undefined}
                  onChange={(e) =>
                    setSelectedBuilding(
                      buildings.find((b) => b.id === Number(e.target.value!))
                    )
                  }
                >
                  <option>Select building</option>
                  {buildings &&
                    buildings.map((b) => {
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
                <Form.Text>
                  Select the building you want to produce the item with
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>
          {selectedBuilding ? (
            <Card style={{ minWidth: "100%", flex: 1, minHeight: 50 }}>
              <Card.Body>
                <Card.Title>Building Statistics</Card.Title>

                <div>
                  <p
                    style={{
                      color: selectedBuilding.electricityGenerated
                        ? "darkgreen"
                        : "darkred",
                    }}
                  >
                    Electricity{" "}
                    {selectedBuilding.electricityGenerated
                      ? "production"
                      : "consumtion"}
                    :
                    {selectedBuilding.electricityGenerated
                      ? ` ${selectedBuilding.electricityGenerated}`
                      : ` ${selectedBuilding.electricityUsed}`}
                    MW (${electricalPrice || "?"} / MW) <br />
                    {selectedBuilding.electricityGenerated
                      ? "Generates"
                      : "Cost: "}
                    {" $"}
                    {(electricalPrice || 0) *
                      (selectedBuilding.electricityGenerated ||
                        selectedBuilding.electricityUsed ||
                        0) +
                      " / 10 min"}
                  </p>
                  <p>Total active: {selectedBuilding.total_amount_placed}</p>
                </div>
              </Card.Body>
            </Card>
          ) : null}
          <Card style={{ minWidth: "50%", flex: 1, minHeight: 180 }}>
            <Card.Body>
              {selectedBuilding ? (
                <>
                  {selectedBuilding.consumes_items &&
                  selectedBuilding.consumes_items.length > 0 ? (
                    <>
                      <Card.Title>Consumtion</Card.Title>
                      <Table>
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th style={{ textAlign: "right" }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedBuilding.consumes_items?.map((ci) => {
                            return (
                              <tr key={ci.id}>
                                <td>
                                  {" "}
                                  <img
                                    style={{ marginRight: 10 }}
                                    height={18}
                                    src={
                                      "./icons/" + ci.item.market_name + ".png"
                                    }
                                  />
                                  {ci.item.name}
                                </td>
                                <td
                                  style={{
                                    textAlign: "right",
                                  }}
                                >
                                  {ci.amount}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </>
                  ) : (
                    <p>
                      <em>Building doesn't consume materials.</em>
                    </p>
                  )}
                  <h5>Output</h5>
                  <b>
                    {selectedBuilding.outputItem
                      ? selectedBuilding.output_amount +
                        "x " +
                        selectedBuilding.outputItem.name
                      : "$" + selectedBuilding.output_amount}{" "}
                  </b>
                </>
              ) : (
                <p>
                  <em>Building doesnt consume any items.</em>
                </p>
              )}
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
                    Craft building
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
