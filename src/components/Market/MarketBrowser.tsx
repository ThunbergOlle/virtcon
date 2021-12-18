import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  FormGroup,
  FormLabel,
  Table,
} from "react-bootstrap";
import Draggable from "react-draggable";
import socketIOClient, { Socket } from "socket.io-client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ItemPriceChange } from "../../functions/ItemPriceChange";
import { WindowTypes } from "../../pages/index/IndexPage";
import { HideStyle } from "../../utils/HideStyle";
import { Item, MarketListing } from "../../utils/interfaces";
import WindowHeader from "../WindowHeader";
import "./MarketBrowser.css";
import { SocketContext } from "../../context/SocketContext";
import Popup from "reactjs-popup";
import { toast } from "react-toastify";

import { PlayerContext } from "../../context/PlayerContext";
import { emitCustomEvent } from "react-custom-events";

interface ExtendedItemPriceUpdate extends Item {
  change: 1 | 0 | -1;
}
export default function MarketBrowser(props: {
  isOpen: boolean;
  onFocus: (windowType: WindowTypes) => void;
  onClose: () => void;
  className: string;
  onRecipeClick: (ItemID: number) => void;
  selectedMarketItem?: number;
}) {
  let timer: any;
  const socket = useContext(SocketContext);
  const getPlayer = useContext(PlayerContext);
  const [hideContent, setHideContent] = useState(false);
  const [prevRoom, setPrevRoom] = useState<number | undefined>(undefined);
  const [marketListings, setMarketListings] = useState<MarketListing[]>([]);
  const [listedItem, setListedItem] = useState<{
    item?: Item;
    maxAmountSellable?: number;
  }>({});
  const [listedItemHistory, setListedItemHistory] = useState<
    { price: number; executed: Date; id: number }[]
  >([]);

  const [newMarketListing, setNewMarketListing] = useState<MarketListing>({
    amount: 0,
    price: 0,
    isSellOrder: false,
  });
  const [items, setItems] = useState<ExtendedItemPriceUpdate[]>([]);
  const client = useApolloClient();

  const onSendOrderPressed = async () => {
    const buyToast = toast.loading("Sending order...", { autoClose: 5000 });

    //Skicka en order till marknaden.
    const query = gql`
      mutation main($data: NewMarketListingInput!) {
        NewListing(data: $data) {
          success
          message
          balance_new
        }
      }
    `;
    if (listedItem.item) {
      const res = await client.query({
        query: query,
        variables: { data: { ...newMarketListing, item: listedItem.item.id } },
      });
      if (!res.data.NewListing.success) {
        toast.update(buyToast, {
          render: "Order denied: " + res.data.NewListing.message,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      } else {
        toast.update(buyToast, {
          render: "Order successfully sent",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } else {
      toast.update(buyToast, {
        render: "Order denied: Refresh game?",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };
  const onItemPressed = (itemId: number) => {
    // Hämta inventory data om vad vi har för sak
    // Vi vill joina ett rum med den item:en i.
    const query = gql`
      query main($inventoryFilter: InventoryFilter, $itemFilter: ItemFilter) {
        Inventory(filter: $inventoryFilter) {
          amount
        }
        Item(filter: $itemFilter) {
          id
          market_name
          name
          price
        }
      }
    `;
    client
      .query({
        query: query,
        variables: {
          inventoryFilter: { player: getPlayer!.id, item: itemId },
          itemFilter: { id: itemId },
        },
      })
      .then((res) => {
        console.dir(res);
        setListedItem({
          item: res.data.Item[0],
          maxAmountSellable: res.data.Inventory[0]?.amount,
        });
        console.dir(listedItem);
      })
      .catch((e) => {
        console.log(e);
      });
    socket.emit("selectRoom", {
      newRoom: itemId,
      prevRoom: prevRoom,
    });
    setPrevRoom(itemId);
  };
  const marketFetcher = () => {
    let prevItems: ExtendedItemPriceUpdate[] = [];
    if (!timer)
      timer = setInterval(() => {
        const query = gql`
          query {
            Item {
              name
              market_name
              id
              price
            }
          }
        `;
        client
          .query({
            query: query,
          })
          .then((res) => {
            let newItems: ExtendedItemPriceUpdate[] = [...res.data.Item];

            if (prevItems) {
              newItems = newItems.map((i) => ({
                ...i,
                change: ItemPriceChange(i, prevItems),
              }));
              prevItems = newItems;
              setItems(newItems);
            } else setItems(newItems);
          })
          .catch((e) => {
            console.log(e);
          });
      }, 3000);
  };
  useEffect(() => {
    marketFetcher();
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (props.selectedMarketItem) {
      onItemPressed(props.selectedMarketItem);
    }
  }, [props.selectedMarketItem]);
  useEffect(() => {
    socket.on(
      "marketData",
      (data: { listings: MarketListing[]; history: any }) => {
        console.log("RECEIVED MARKET DATA");
        data.listings.splice(50, data.listings.length);
        setMarketListings(data.listings);
        setListedItemHistory(data.history.reverse());
        emitCustomEvent("inventoryUpdate");
        emitCustomEvent("statListUpdate");
        emitCustomEvent("myMarketListingsUpdate");
      }
    );

    return () => {};
  }, []);

  return (
    <Draggable
      axis="both"
      handle=".handle"
      defaultPosition={{ x: 40, y: 10 }}
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("marketBrowser")}
    >
      <Card
        style={{ width: 1200, ...HideStyle(!props.isOpen), display: "flex" }}
      >
        <WindowHeader title="Market viewer" onClose={() => props.onClose()} />
        <div
          style={{
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            flexDirection: "row",
          }}
        >
          <Card style={{ minWidth: "32%", flex: 1, minHeight: 500 }}>
            <Card.Body>
              <Card.Title>
                Items on the market {props.selectedMarketItem}
              </Card.Title>
              <div className="marketItemContainer">
                {items.map((i) => (
                  <div
                    className="marketItemSmall"
                    key={i.id}
                    onClick={() => onItemPressed(i.id)}
                    style={{
                      backgroundColor:
                        listedItem && i.id === listedItem?.item?.id
                          ? "lightgrey"
                          : "white",
                    }}
                  >
                    <img
                      src={"./icons/" + i.market_name + ".png"}
                      height={22}
                      width={22}
                    />
                    <p className="title">{i.name}</p>
                    <p className={"price" + " change" + i.change}>{i.price}</p>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
          <Card style={{ minWidth: "68%", flex: 2, minHeight: 180 }}>
            {listedItem.item ? (
              <Card.Body>
                <Card.Title style={{ textAlign: "center" }}>
                  {listedItem.item.name}
                </Card.Title>
                <ResponsiveContainer height="60%" width="100%">
                  <LineChart
                    height={400}
                    data={listedItemHistory}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid stroke="#f5f5f5" />
                    <XAxis dataKey="executed" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="price"
                      name="Price"
                      stroke="#387908"
                      yAxisId={0}
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div style={{ display: "flex", width: "100%" }}>
                  <div style={{ flex: 3 }}>
                    <h5>Sell orders</h5>
                    <Table striped bordered hover style={{ fontSize: 12 }}>
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th style={{ textAlign: "right" }}>Amount</th>
                          <th style={{ textAlign: "right" }}>Price</th>
                        </tr>
                      </thead>

                      <tbody>
                        {marketListings
                          .filter((l) => l.isSellOrder)
                          .sort((a, b) => (a.price! - b.price! ? -1 : 1))
                          .map((l: MarketListing) => (
                            <tr id={String(l.id)} key={l.id}>
                              <td>{l.player!.display_name}</td>
                              <td style={{ textAlign: "right" }}>{l.amount}</td>
                              <td style={{ textAlign: "right" }}>{l.price}</td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <Popup
                      trigger={
                        <Button
                          style={{
                            marginTop: 32,
                            width: "90%",
                            backgroundColor: "green",
                          }}
                          size="sm"
                        >
                          New order
                        </Button>
                      }
                    >
                      <Card style={{ width: 400 }}>
                        <Card.Body>
                          <Card.Title>Place new order</Card.Title>
                          <FormGroup>
                            <FormLabel>Type</FormLabel>
                            <Form.Control
                              as="select"
                              size="sm"
                              value={Number(newMarketListing?.isSellOrder)}
                              onChange={(e) => {
                                setNewMarketListing({
                                  ...newMarketListing,
                                  isSellOrder: Boolean(Number(e.target.value)),
                                });
                              }}
                            >
                              <option value={0}>Buy order</option>
                              <option
                                value={1}
                                disabled={!listedItem.maxAmountSellable}
                              >
                                Sell order
                              </option>
                            </Form.Control>
                          </FormGroup>
                          <FormGroup>
                            <FormLabel>
                              Amount - you have:{" "}
                              {listedItem.maxAmountSellable || "?"}
                            </FormLabel>
                            <Form.Control
                              as="input"
                              type={"number"}
                              step={1}
                              size="sm"
                              value={newMarketListing?.amount || ""}
                              onChange={(e) => {
                                if (Number(e.target.value) < 0) return;
                                if (!newMarketListing.isSellOrder) {
                                  setNewMarketListing({
                                    ...newMarketListing,
                                    amount: Number(e.target.value!),
                                  });
                                } else {
                                  setNewMarketListing({
                                    ...newMarketListing,
                                    amount:
                                      listedItem!.maxAmountSellable! >=
                                      Number(e.target.value)
                                        ? Number(e.target.value)
                                        : listedItem.maxAmountSellable,
                                  });
                                }
                              }}
                            ></Form.Control>
                          </FormGroup>
                          <FormGroup>
                            <FormLabel>Price</FormLabel>
                            <Form.Control
                              as="input"
                              type={"number"}
                              step={1}
                              size="sm"
                              value={newMarketListing?.price || ""}
                              onChange={(e) => {
                                if (Number(e.target.value) < 0) return;
                                setNewMarketListing({
                                  ...newMarketListing,
                                  price: Number(e.target.value || 0),
                                });
                              }}
                            ></Form.Control>
                          </FormGroup>
                          <Button
                            size="sm"
                            style={{ marginTop: 15, float: "right" }}
                            onClick={() => onSendOrderPressed()}
                          >
                            Send order
                          </Button>
                        </Card.Body>
                      </Card>
                    </Popup>
                    <Button
                      style={{ marginTop: 30, width: "90%" }}
                      size="sm"
                      onClick={() => {
                        console.log("CLICKED VIEW RECIPE", listedItem.item?.id);
                        props.onRecipeClick(listedItem.item?.id || 0);
                      }}
                    >
                      View recipe
                    </Button>
                  </div>
                  <div style={{ flex: 3 }}>
                    <h5>Buy orders</h5>
                    <Table striped bordered hover style={{ fontSize: 12 }}>
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th style={{ textAlign: "right" }}>Amount</th>
                          <th style={{ textAlign: "right" }}>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketListings
                          .filter((l) => !l.isSellOrder)
                          .map((l: MarketListing) => (
                            <tr id={String(l.id)} key={l.id}>
                              <td>{l.player!.display_name}</td>
                              <td style={{ textAlign: "right" }}>{l.amount}</td>
                              <td style={{ textAlign: "right" }}>{l.price}</td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </Card.Body>
            ) : (
              <Card.Body>
                <h3 style={{ textAlign: "center" }}>
                  Select an item to view its market data
                </h3>
              </Card.Body>
            )}
          </Card>
        </div>
      </Card>
    </Draggable>
  );
}
