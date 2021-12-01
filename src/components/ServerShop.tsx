import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useEffect, useState } from "react";
import { Button, Card, ListGroup, Table } from "react-bootstrap";
import Draggable from "react-draggable";
import { toast } from "react-toastify";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";

import WindowHeader from "./WindowHeader";
export default function ServerShop(props: {
  isOpen: boolean;
  onPurchase: Function;
  className: string;
  onClose: () => void;
  onFocus: (windowType: WindowTypes) => void;
}) {
  const [hideContent, setHideContent] = useState(false);
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
  useEffect(() => {}, []);
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
            <th>Action</th>
          </thead>
          <tbody>
            <tr>
              <td>
                <img src={"./icons/plot.png"} height="25" />
              </td>
              <td>Plot</td>
              <td>1500</td>
              <td>
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
              </td>
            </tr>
          </tbody>
        </Table>
      </Card>
    </Draggable>
  );
}
