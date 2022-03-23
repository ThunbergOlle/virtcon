import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import { useContext, useEffect, useState } from "react";
import { Button, Card, Table } from "react-bootstrap";
import Draggable from "react-draggable";
import { toast } from "react-toastify";
import { PlayerContext } from "../context/PlayerContext";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";

import WindowHeader from "./WindowHeader";
export default function BlackMarket(props: {
  isOpen: boolean;
  className: string;
  onClose: () => void;
  onFocus: (windowType: WindowTypes) => void;
}) {
  const player = useContext(PlayerContext);
  const [hasBlackMarketAccess, setHasBlackMarketAccess] =
    useState<boolean>(false);
  const client = useApolloClient();

  const loadBlackMarket = () => {
    const query = gql`
      query {
       
      }
    `;
    client
      .query({
        query: query,
      })
      .then((res) => {
        // update state
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const unlockBlackMarket = () => {
    const buyToast = toast.loading("Sending buy order...", { autoClose: 5000 });
    //do something else
    const mutation = gql`
      mutation ServerShopPurchase($name: String!) {
        ServerShopPurchase(name: $name) {
          success
          balance_new
        }
      }
    `;

    client
      .mutate({
        mutation: mutation,
        variables: { name: "Black Market" },
      })
      .then((res) => {
        if (res.data.ServerShopPurchase?.success) {
          toast.update(buyToast, {
            render:
              "Purchase successful. New balance: " +
              res.data.ServerShopPurchase.balance_new,
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });
          setHasBlackMarketAccess(true);
          loadBlackMarket();
        } else if (res.errors) {
          toast.update(buyToast, {
            render: "Buy order denied: " + res.errors[0].message,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        } else {
          toast.update(buyToast, {
            render: "Buy order denied: You can not afford this item",
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
  useEffect(() => {
    if (player && player.hasBlackMarketAccess) {
      setHasBlackMarketAccess(true);
      //loadBlackMarket();
    }
  }, [player]);
  return (
    <Draggable
      axis="both"
      handle=".handle"
      bounds={{ top: 0 }}
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("blackMarket")}
      defaultPosition={{ x: 40, y: 10 }}
    >
      <Card style={{ width: 600, ...HideStyle(!props.isOpen) }}>
        <WindowHeader title="Black Market" onClose={() => props.onClose()} />
        {hasBlackMarketAccess ? (
          <div style={{ textAlign: "center" }}>
            <h4>Next auction will be held</h4>
            <h5 style={{ fontWeight: "bold" }}>*UNDER CONSTRUCTION*</h5>
            <Button
              disabled
              style={{ backgroundColor: "darkgreen", borderColor: "darkgreen" }}
            >
              Join Auction
            </Button>
            <div style={{ margin: 10, fontStyle: "italic" }}>
              <p>
                All bids are anonymous and items purschased from the black
                market will be kept secret in your inventory
              </p>
              <p>
                Black Market items are not tradable on the public market and can
                therefor not be sold to other players
              </p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h3 style={{ color: "darkred" }}>ACCESS DENIED</h3>
            <p>
              <em>
                You need to buy black market access in order to use this feature
              </em>
            </p>
            <Button onClick={() => unlockBlackMarket()}>Buy for $25 000</Button>
          </div>
        )}
      </Card>
    </Draggable>
  );
}
