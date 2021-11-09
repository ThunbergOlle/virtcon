import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useEffect, useState } from "react";
import { Button, Card, ListGroup, Table } from "react-bootstrap";
import Draggable from "react-draggable";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import { Item } from "../utils/interfaces";
import WindowHeader from "./WindowHeader";
export default function ItemBrowser(props: {
  isOpen: boolean;
  className: string;
  onFocus: (windowType: WindowTypes) => void;
}) {
  const [hideContent, setHideContent] = useState(false);
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
    console.log(query);
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
      <Card style={{ width: 500, ...HideStyle(!props.isOpen) }}>
        <WindowHeader
          title="Item Browser"
          onChange={(hide: boolean) => setHideContent(hide)}
        />

        <Table hover style={HideStyle(hideContent)}>
          <thead>
            <th>Icon</th>
            <th>Name</th>
            <th>Type</th>
            <th>Rarity</th>
            <th>View on Market</th>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr id={String(i.id)} key={i.id}>
                <td>
                  <img src={`./icons/${i.market_name}.png`} height="25" />
                </td>
                <td>{i.name}</td>
                <td>{i.type}</td>
                <td>{i.rarity}</td>
                <td>
                  <Button
                    size="sm"
                    style={{
                      height: 22,
                      margin: 0,
                      padding: 0,
                      width: "100%",
                    }}
                    disabled={i.type === "currency"}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Draggable>
  );
}
