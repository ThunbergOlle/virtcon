import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useEffect, useState } from "react";
import { Button, Card, Form, ListGroup, Table } from "react-bootstrap";
import { emitCustomEvent, useCustomEventListener } from "react-custom-events";
import Draggable from "react-draggable";
import { BuildingAddToPlot } from "../functions/BuildingAddToPlot";
import { pickupBuilding } from "../functions/PickupBuilding";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import { InventoryItem, Item, Plot } from "../utils/interfaces";
import BuildingSelect from "./BuildingSelect";
import WindowHeader from "./WindowHeader";
export default function Inventory(props: {
  isOpen: boolean;
  onClose: Function;
  selectedPlotId?: number;
  onFocus: (windowType: WindowTypes) => void;
  className: string;
}) {
  const [hideContent, setHideContent] = useState(false);
  const [electricityPrice, setElectricityPrice] = useState<number>(0);
  const [plot, setPlot] = useState<Plot>();
  const client = useApolloClient();

  const fetchPlotData = async () => {
    if (!props.selectedPlotId) return;
    const query = gql`
      query main($id: Int) {
        Plot(filter: { id: $id }) {
          id
          max_buildings
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
    setElectricityPrice(data.data.ServerShopPrices[0].price);
  };
  useCustomEventListener("selectedPlotUpdate", async (data) => {
    // När inventoryt har uppdaterats så ska vi hämta datan igen
    fetchPlotData();
  });
  useEffect(() => {
    fetchPlotData();
  }, [props.selectedPlotId]);

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
          <Card style={{ minWidth: "50%", flex: 1, minHeight: 180 }}>
            <Card.Body>
              <Card.Title>Overview</Card.Title>
              <Card.Text>Plot ID: #{plot?.id}</Card.Text>
              <Card.Text>
                Buildings: {plot?.buildings?.length || 0} /{" "}
                {plot?.max_buildings || 0}
              </Card.Text>
              <Card.Text>
                Resources:{" "}
                {plot?.resources
                  .map((r) => r.amount)
                  ?.reduce((previous, current) => previous + current) || 0}
              </Card.Text>
              <Card.Text style={{ fontStyle: "italic" }}>
                Note: You can have a maximum of 2 building types (names) on one
                plot.
              </Card.Text>
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
                    <tr key={b.id}>
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
              {plot?.id ? (
                <BuildingSelect
                  placedBuildingTypes={Array.from(
                    new Set(plot.buildings.map((b) => b.building.name))
                  )}
                  onSelect={(buildingId) => {
                    BuildingAddToPlot(buildingId, plot!.id!);
                  }}
                />
              ) : null}
            </Card.Body>
          </Card>
        </div>
      </Card>
    </Draggable>
  );
}
