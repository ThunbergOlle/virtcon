import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useEffect, useState } from "react";
import { Button, Card, ListGroup, Table } from "react-bootstrap";
import Draggable from "react-draggable";
import { toast } from "react-toastify";
import { PlayerContext } from "../context/PlayerContext";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import { ServerShopPrices } from "../utils/interfaces";

import WindowHeader from "./WindowHeader";
export default function ServerShop(props: {
  isOpen: boolean;
  onPurchase: Function;
  className: string;
  onClose: () => void;
  onFocus: (windowType: WindowTypes) => void;
}) {
  const [hideContent, setHideContent] = useState(false);
  const [shopItems, setShopItems] = useState<ServerShopPrices[]>([]);
  const client = useApolloClient();
  const buy = (name: string) => {
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
        variables: { name: name },
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
          load();
          props.onPurchase();
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
        console.log(res.data.ServerShopPurchase);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const load = () => {
    const query = gql`
      query {
        ServerShopPrices {
          name
          price
        }
      }
    `;
    client
      .query({
        query: query,
      })
      .then((res) => {
        setShopItems(res.data.ServerShopPrices);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <Draggable
      axis="both"
      handle=".handle"
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("serverShop")}
      defaultPosition={{ x: 40, y: 10 }}
    >
      <Card style={{ width: 600, ...HideStyle(!props.isOpen) }}>
        <WindowHeader title="Server shop" onClose={() => props.onClose()} />

        <Table hover striped style={HideStyle(hideContent)}>
          <thead>
            <th>Icon</th>
            <th>Name</th>
            <th>Price</th>
            <th style={{ width: 160 }}>Action</th>
          </thead>
          <tbody>
            {shopItems.map((s) => (
              <tr>
                <td>
                  <img
                    src={"./icons/" + s.name.toLowerCase() + ".png"}
                    height="25"
                  />
                </td>
                <td>{s.name}</td>
                <td>{s.price}</td>
                <td>
                  {s.name === "Plot" ? (
                    <Button
                      size="sm"
                      style={{
                        height: 22,
                        margin: 0,
                        padding: 0,
                        width: "100%",
                      }}
                      onClick={() => buy("plot")}
                    >
                      Buy
                    </Button>
                  ) : (
                    <em style={{ width: "100%" }}>Automatically buying</em>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Draggable>
  );
}
