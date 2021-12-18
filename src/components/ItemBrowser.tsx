import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useEffect, useState } from "react";
import { Button, Card, ListGroup, Table } from "react-bootstrap";
import Draggable from "react-draggable";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import { Item } from "../utils/interfaces";
import WindowHeader from "./WindowHeader";
import ReactTooltip from "react-tooltip";

export default function ItemBrowser(props: {
  isOpen: boolean;
  className: string;
  onFocus: (windowType: WindowTypes) => void;
  onClose: (windowType: WindowTypes) => void;
  onViewMarketClicked: (ItemID: number) => void;
  onRecipeClicked: (ItemID: number) => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const client = useApolloClient();

  useEffect(() => {
    const query = gql`
      query {
        Item {
          name
          market_name
          spawn_rate
          type
          id
          rarity
        }
      }
    `;
    client
      .query({
        query: query,
      })
      .then((res) => {
        console.log(res.data.Item);
        setItems(res.data.Item);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  return (
    <Draggable
      axis="both"
      handle=".handle"
      defaultPosition={{ x: 40, y: 10 }}
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("itemBrowser")}
    >
      <Card style={{ width: 700, ...HideStyle(!props.isOpen) }}>
        <WindowHeader
          title="Item Browser"
          onClose={() => props.onClose("itemBrowser")}
        />
        <div
          style={{
            overflowY: "scroll",
            display: "flex",
            flexDirection: "column",
            height: 400,
          }}
        >
          <Table hover>
            <thead>
              <th>Icon</th>
              <th>Name</th>
              <th>Type</th>
              <th>Rarity</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr
                  id={String(i.id)}
                  key={i.id}
                  style={{ cursor: "pointer" }}
                  data-tip
                  data-for="clickme"
                >
                  <td>
                    <img src={`./icons/${i.market_name}.png`} height="25" />
                  </td>
                  <td>{i.name}</td>
                  <td>{i.type}</td>
                  <td>{i.rarity}</td>
                  <td style={{ textAlign: "right" }}>
                    <Button
                      size="sm"
                      style={{ marginRight: 10 }}
                      onClick={() => {
                        props.onRecipeClicked(i.id);
                      }}
                    >
                      View recipe{" "}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        props.onViewMarketClicked(i.id);
                      }}
                    >
                      View market
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
