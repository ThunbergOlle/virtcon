import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import { useContext, useEffect, useState } from "react";
import { Button, Card, Table } from "react-bootstrap";
import { emitCustomEvent, useCustomEventListener } from "react-custom-events";
import Draggable from "react-draggable";
import { BuildingAddToPlot } from "../functions/BuildingAddToPlot";
import { pickupBuilding } from "../functions/PickupBuilding";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import { Plot, PlotGrid } from "../utils/interfaces";
import BuildingSelect from "./BuildingSelect";
import WindowHeader from "./WindowHeader";
import Map from "./Map";
import { PlayerContext } from "../context/PlayerContext";
import { toast } from "react-toastify";
import { MoneyFormatter } from "../utils/MoneyFormatter";
export default function Plotviewer(props: {
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
      query fetchPlotData($id: Int) {
        Plot(filter: { id: $id }) {
          id
          max_buildings
          lastPrice
          isInteractive
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
            height
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
  const sellPlotPrompt = async (plotId: number) => {
    const price = Number(
      (await prompt(
        "How much do you want to list the plot for ($)?\n\nNote: A listed plot on the market will not be interactable nor generate money or produce items",
        "0"
      )) || ""
    );
    if (!price) return;
    // L??gg ut ploten p?? marknaden.
    const buyToast = toast.loading("Sending buy order...", { autoClose: 5000 });
    //do something else
    const mutation = gql`
      mutation SellPlotOnMarket($plotId: Int!, $price: Int!) {
        SellPlotOnMarket(plotId: $plotId, price: $price) {
          success
          message
        }
      }
    `;

    client
      .mutate({
        mutation: mutation,
        variables: { plotId: plotId, price: price },
      })
      .then((res) => {
        if (res.data.SellPlotOnMarket?.success) {
          toast.update(buyToast, {
            render: "Listing successful",
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });

          fetchPlotData();
          emitCustomEvent("plotMarketUpdate");
        } else if (res.errors) {
          toast.update(buyToast, {
            render: "Buy order denied: " + res.errors[0].message,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        } else {
          toast.update(buyToast, {
            render: "Buy order denied: " + res.data.SellPlotOnMarket.message,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const buyPlot = (plotId: number) => {
    const buyToast = toast.loading("Sending buy order...", { autoClose: 5000 });
    //do something else
    const mutation = gql`
      mutation BuyPlotFromMarket($plotId: Int!) {
        BuyPlotFromMarket(plotId: $plotId) {
          success
          balance_new
          message
        }
      }
    `;

    client
      .mutate({
        mutation: mutation,
        variables: { plotId: plotId },
      })
      .then((res) => {
        if (res.data.BuyPlotFromMarket?.success) {
          toast.update(buyToast, {
            render:
              "Purchase successful. New balance: " +
              res.data.BuyPlotFromMarket.balance_new,
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });

          fetchPlotData();
          emitCustomEvent("plotMarketUpdate");
          emitCustomEvent("plotUpdate");
        } else if (res.errors) {
          toast.update(buyToast, {
            render: "Buy order denied: " + res.errors[0].message,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        } else {
          toast.update(buyToast, {
            render: "Buy order denied: " + res.data.BuyPlotFromMarket.message,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const pickupAllBuildingsPrompt = async () => {
    const isSure = window.confirm(
      "Are you sure you want to pickup all buildings on this plot?"
    );
    if (isSure && plot) {
      for (let i = 0; i < plot.buildings.length; i++) {
        await pickupBuilding(plot.buildings[i].id);
      }
      fetchPlotData();
      emitCustomEvent("productionOverviewUpdate");
      emitCustomEvent("backgroundUpdate");
      emitCustomEvent("buildingOverviewUpdate");
    }
  };
  const removePlotFromMarket = (plotId: number) => {
    const buyToast = toast.loading("Trying to remove...", { autoClose: 5000 });
    //do something else
    const mutation = gql`
      mutation RemovePlotFromMarket($plotId: Int!) {
        RemovePlotFromMarket(plotId: $plotId) {
          success
          balance_new
          message
        }
      }
    `;

    client
      .mutate({
        mutation: mutation,
        variables: { plotId: plotId },
      })
      .then((res) => {
        if (res.data.RemovePlotFromMarket?.success) {
          toast.update(buyToast, {
            render: "Successfully removed plot from market ",
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });

          fetchPlotData();
          emitCustomEvent("plotMarketUpdate");
        } else if (res.errors) {
          toast.update(buyToast, {
            render: "Could not remove market order: " + res.errors[0].message,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        } else {
          toast.update(buyToast, {
            render:
              "Could not remove market order: " +
              res.data.RemovePlotFromMarket.message,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };
  useCustomEventListener("selectedPlotUpdate", async (data) => {
    // N??r inventoryt har uppdaterats s?? ska vi h??mta datan igen
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
      bounds={{ top: 0 }}
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
                      {isOwner && plot?.isInteractive ? (
                        <>
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
                {plot?.lastPrice
                  ? MoneyFormatter.format(plot.lastPrice)
                  : "No data"}
              </Card.Text>
              {plot?.askedPrice ? (
                <Card.Text>
                  On market for:
                  {" $" + plot.askedPrice}
                </Card.Text>
              ) : null}
              {plot?.askedPrice && plot?.owner?.id !== getPlayer.id ? (
                <>
                  <Button size="sm" onClick={() => buyPlot(plot.id)}>
                    Buy now for{" $" + plot.askedPrice}
                  </Button>
                  <Card.Text className="text-muted">
                    An additional fee of ${Math.floor(plot.askedPrice * 0.05)}{" "}
                    (5%) will be charged when purchasing this plot.
                  </Card.Text>
                </>
              ) : null}
              {plot &&
              plot.owner?.id === getPlayer.id &&
              plot?.buildings.length > 0 ? (
                <Button size="sm" onClick={() => pickupAllBuildingsPrompt()}>
                  Pickup all buildings on plot
                </Button>
              ) : null}

              <p className="text-muted" style={{ fontStyle: "italic" }}>
                Note: You don't have to place the buildings on the resources in
                order to extract them,{" "}
                <a href="https://docs.virtcongame.com/#plot-system">
                  read the docs
                </a>
              </p>
              {plot?.owner?.id === getPlayer.id && !plot?.isInteractive && (
                <Button
                  size="sm"
                  onClick={() => removePlotFromMarket(plot!.id!)}
                >
                  Remove market listing
                </Button>
              )}
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
                          disabled={!isOwner || !plot?.isInteractive}
                          onClick={() => {
                            pickupBuilding(b.id).then(() => {
                              fetchPlotData();
                              emitCustomEvent("productionOverviewUpdate");
                              emitCustomEvent("backgroundUpdate");
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
