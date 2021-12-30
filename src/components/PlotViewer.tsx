import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Form, ListGroup, Table } from "react-bootstrap";
import { emitCustomEvent, useCustomEventListener } from "react-custom-events";
import Draggable from "react-draggable";
import { BuildingAddToPlot } from "../functions/BuildingAddToPlot";
import { pickupBuilding } from "../functions/PickupBuilding";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import { InventoryItem, Item, Plot, PlotGrid } from "../utils/interfaces";
import BuildingSelect from "./BuildingSelect";
import WindowHeader from "./WindowHeader";
import Map from "./Map";
import { PlayerContext } from "../context/PlayerContext";
export default function Inventory(props: {
  isOpen: boolean;
  onClose: Function;
  selectedPlotId?: number;
  onFocus: (windowType: WindowTypes) => void;
  className: string;
}) {
  const [electricityPrice, setElectricityPrice] = useState<number>(0);
  const [plot, setPlot] = useState<Plot>();
  const [highlightedTile, setHighlightedTile] = useState<PlotGrid>();
  const client = useApolloClient();
  const getPlayer = useContext(PlayerContext);
  const fetchPlotData = async () => {
    if (!props.selectedPlotId) return;
    const query = gql`
      query main($id: Int) {
        Plot(filter: { id: $id }) {
          id
          max_buildings
          lastPrice
          askedPrice
          buildings {
            id
            building {
              name
              consumes_items {
                id
                amount
                item {
                  name
                  price
                  market_name
                }
              }
              outputItem {
                name
                rarity
              }
              output_amount
              electricityUsed
              electricityGenerated
            }
            occupiesResource {
              resource {
                name
              }
            }
          }
          resources {
            id
            resource {
              name
            }
            amountUsed
            amount
          }
          grid {
            x
            y
            id
            resource {
              resource {
                name
                market_name
              }
              amount
              amountUsed
            }
            building {
              id
              building {
                name
                outputItem {
                  market_name
                }
                electricityGenerated
                output_amount
              }
            }
          }
          owner {
            id
            display_name
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
      variables: { id: props.selectedPlotId },
    });
    console.dir(data);
    setPlot(data.data.Plot[0]);
    if (highlightedTile) {
      setHighlightedTile(
        data.data.Plot[0].grid.find(
          (g: PlotGrid) => g.id === highlightedTile.id
        )
      );
    }
    setElectricityPrice(data.data.ServerShopPrices[0].price);
  };
  useCustomEventListener("selectedPlotUpdate", async (data) => {
    // När inventoryt har uppdaterats så ska vi hämta datan igen
    fetchPlotData();
  });
  useEffect(() => {
    fetchPlotData();
  }, [props.selectedPlotId]);
  const isOwner = getPlayer.id === plot?.owner?.id;
  return (
    <Draggable
      axis="both"
      handle=".handle"
      defaultPosition={{ x: 40, y: 10 }}
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("plotViewer")}
    >
      <Card
        style={{ width: 800, ...HideStyle(!props.isOpen), display: "flex" }}
      >
        <WindowHeader title="Plot viewer" onClose={() => props.onClose()} />
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
              <Card.Title>Map</Card.Title>
              <div style={{ flexDirection: "row", display: "flex" }}>
                <div style={{ maxWidth: "50%", flex: 1 }}>
                  {plot && (
                    <Map
                      width={40}
                      rowSize={8}
                      grid={plot.grid || []}
                      onTileClicked={(highlightedTile) =>
                        setHighlightedTile(highlightedTile)
                      }
                    />
                  )}
                </div>
                <Card style={{ width: "50%", flex: 1 }}>
                  {highlightedTile ? (
                    <Card.Body>
                      {isOwner ? (
                        <>
                          <Card.Title>
                            Tile inspection (x: {highlightedTile.x + 1}, y:
                            {highlightedTile.y + 1})
                          </Card.Title>
                          <p>
                            Resource:{" "}
                            {highlightedTile.resource?.resource.name ||
                              "No resource"}{" "}
                            {highlightedTile.resource ? (
                              <img
                                height={20}
                                src={`icons/${highlightedTile.resource?.resource.market_name}.png`}
                                alt="(image not found)"
                              />
                            ) : null}
                          </p>
                          <p>Amount: {highlightedTile.resource?.amount || 0}</p>
                          <p>
                            Amount utilized:{" "}
                            {highlightedTile.resource?.amountUsed || 0}
                          </p>
                          <p>
                            Building:{" "}
                            {highlightedTile.building?.building?.name ||
                              "No building placed"}
                          </p>
                          {!highlightedTile.building ? (
                            <BuildingSelect
                              placedBuildingTypes={Array.from(
                                new Set(
                                  plot?.buildings.map((b) => b.building.name)
                                )
                              )}
                              onSelect={(buildingId) => {
                                BuildingAddToPlot(
                                  buildingId,
                                  plot!.id!,
                                  highlightedTile!.id
                                );
                              }}
                            />
                          ) : (
                            <Button
                              size="sm"
                              style={{
                                height: 22,
                                margin: 0,
                                padding: 0,
                                width: "100%",
                              }}
                              onClick={() => {
                                if (highlightedTile.building?.id) {
                                  pickupBuilding(
                                    highlightedTile.building?.id
                                  ).then(() => fetchPlotData());
                                }
                              }}
                            >
                              Pickup building
                            </Button>
                          )}
                        </>
                      ) : null}
                    </Card.Body>
                  ) : null}
                </Card>
              </div>
            </Card.Body>
          </Card>
          <Card style={{ minWidth: "50%", flex: 1, minHeight: 180 }}>
            <Card.Body>
              <Card.Title>Overview</Card.Title>
              <Card.Text>Plot ID: #{plot?.id}</Card.Text>
              <Card.Text>Owner: {plot?.owner?.display_name}</Card.Text>
              <Card.Text>
                Buildings: {plot?.buildings?.length || 0} /{" "}
                {plot?.max_buildings || 0}
              </Card.Text>
              <Card.Text>
                Latest selling price:{" "}
                {plot?.lastPrice ? "$" + plot.lastPrice : "No data"}
              </Card.Text>
              {plot?.askedPrice ? (
                <Card.Text>
                  On market for:
                  {"$" + plot.askedPrice}
                </Card.Text>
              ) : null}
            </Card.Body>
          </Card>
          <Card style={{ minWidth: "50%", flex: 1, minHeight: 180 }}>
            <Card.Body>
              <Card.Title>Resources</Card.Title>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th style={{ textAlign: "right" }}>Utilized Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {plot?.resources?.map((r) => (
                    <tr key={r.id}>
                      <td>{r.resource?.name}</td>
                      <td style={{ textAlign: "right" }}>
                        {r.amountUsed} / {r.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          <Card style={{ minWidth: "50%", flex: 1, minHeight: 180 }}>
            <Card.Body>
              <Card.Title>Buildings</Card.Title>

              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Consuming</th>
                    <th>Generates (10 min)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {plot?.buildings?.map((b) => (
                    <tr
                      key={b.id}
                      style={
                        highlightedTile?.building?.id === b.id
                          ? {
                              backgroundColor: "lightblue",
                            }
                          : undefined
                      }
                    >
                      <td>{b.building?.name}</td>
                      <td>
                        {b.occupiesResource ? (
                          <>{b.occupiesResource.resource?.name} (Occupied)</>
                        ) : (
                          <>
                            {b.building?.consumes_items?.map((i) => (
                              <>
                                {i.item.name || "-"} (-
                                {i.amount}){" "}
                              </>
                            ))}
                          </>
                        )}
                      </td>
                      {b.building.electricityGenerated ? (
                        <td>
                          {b.building.electricityGenerated} MW ($
                          {b.building.electricityGenerated * electricityPrice})
                        </td>
                      ) : (
                        <td>
                          {b.building.outputItem?.name
                            ? b.building.outputItem?.name + " x"
                            : "$"}
                          {b.building.output_amount}
                        </td>
                      )}
                      <td>
                        <Button
                          size="sm"
                          style={{
                            height: 22,
                            margin: 0,
                            padding: 0,
                            width: "100%",
                          }}
                          disabled={!isOwner}
                          onClick={() => {
                            pickupBuilding(b.id).then(() => {
                              fetchPlotData();
                              emitCustomEvent("productionOverviewUpdate");
                            });
                          }}
                        >
                          Pickup
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
      </Card>
    </Draggable>
  );
}
