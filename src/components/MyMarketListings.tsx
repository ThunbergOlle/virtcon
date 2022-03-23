import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useContext, useEffect, useState } from "react";
import { Button, Card, ListGroup, Table } from "react-bootstrap";
import { emitCustomEvent, useCustomEventListener } from "react-custom-events";
import Draggable from "react-draggable";
import { toast } from "react-toastify";
import { PlayerContext } from "../context/PlayerContext";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import { Item, MarketListing } from "../utils/interfaces";
import WindowHeader from "./WindowHeader";
export default function MyMarketListings(props: {
  isOpen: boolean;
  className: string;
  onFocus: (windowType: WindowTypes) => void;
  onClose: (windowType: WindowTypes) => void;
}) {
  const [hideContent, setHideContent] = useState(false);
  const [listings, setListings] = useState<MarketListing[]>([]);
  const player = useContext(PlayerContext);
  const client = useApolloClient();

  const removeMarketListing = (listingId: number) => {
    console.log("removing market listing");
    const mutation = gql`
      mutation removeMarketListing($listingId: Int!) {
        RemoveMarketListing(listingId: $listingId) {
          balance_new
          message
          success
        }
      }
    `;
    client
      .mutate({
        mutation: mutation,
        variables: { listingId: listingId },
      })
      .then((res) => {
        const response: {
          success: boolean;
          balance_new: number;
          message: string;
        } = res.data.RemoveMarketListing;
        if (response.success) {
          toast.success(response.message, { autoClose: 5000 });
          emitCustomEvent("inventoryUpdate");
          emitCustomEvent("statListUpdate");
        } else toast.error(response.message, { autoClose: 5000 });
        load();
      })
      .catch((e) => {
        console.log(e);
      });
  };
  useCustomEventListener("myMarketListingsUpdate", async (data) => {
    load();
  });
  const load = () => {
    const query = gql`
      query loadMyMarketListings($playerId: Int) {
        MarketListing(filter: { playerId: $playerId }) {
          id
          executed
          item {
            name
            market_name
          }
          isSellOrder
          price
          amount
        }
      }
    `;
    client
      .query({
        query: query,
        variables: { playerId: player.id },
      })
      .then((res) => {
        setListings(res.data.MarketListing);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  useEffect(() => {
    if (props.isOpen) {
      load();
    }
  }, [props.isOpen]);

  return (
    <Draggable
      axis="both"
      handle=".handle"
      defaultPosition={{ x: 40, y: 10 }}
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("myMarketListings")}
    >
      <Card style={{ width: 500, ...HideStyle(!props.isOpen) }}>
        <WindowHeader
          title="My market listings"
          onClose={() => props.onClose("myMarketListings")}
          onRefresh={() => load()}
        />
        <div
          style={{
            overflowY: "scroll",
            display: "flex",
            flexDirection: "column",
            height: 400,
          }}
        >
          <Table
            hover
            style={{
              ...HideStyle(hideContent),
            }}
          >
            <thead>
              <th>Icon</th>
              <th>Name</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th style={{ textAlign: "right" }}>Price / each</th>
              <th style={{ textAlign: "right" }}>Remove</th>
            </thead>
            <tbody>
              {listings.map((i) => (
                <tr
                  id={String(i.id)}
                  key={i.id}
                  style={{ color: i.isSellOrder ? "green" : "red" }}
                >
                  <td>
                    <img
                      src={`./icons/${i.item?.market_name}.png`}
                      height="25"
                    />
                  </td>
                  <td>
                    {i.isSellOrder ? "Sell Order: " : "Buy Order: "}
                    {i.item?.name}
                  </td>
                  <td style={{ textAlign: "right" }}>{i.amount}</td>
                  <td style={{ textAlign: "right" }}>{i.price}</td>
                  <td style={{ textAlign: "right" }}>
                    <Button
                      size="sm"
                      style={{
                        backgroundColor: "darkred",
                        borderColor: "darkred",
                      }}
                      onClick={() => removeMarketListing(i.id!)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </Draggable>
  );
}
