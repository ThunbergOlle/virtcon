import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useEffect, useState } from "react";
import { Button, Card, ListGroup, Table } from "react-bootstrap";
import Draggable from "react-draggable";
import { HideStyle } from "../utils/HideStyle";
import { IntrItem } from "../utils/interfaces";
import WindowHeader from "./WindowHeader";
export default function ItemBrowser(props: { isOpen: boolean }) {
  const [hideContent, setHideContent] = useState(false);
  const [items, setItems] = useState<IntrItem[]>([]);
  const client = useApolloClient();

  useEffect(() => {
    const query = gql`
      query {
        Item {
          name
          market_name
          spawn_rate
          type
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
    <div style={HideStyle(!props.isOpen)}>
      <Draggable
        bounds="parent"
        axis="both"
        handle=".handle"
        defaultPosition={{ x: window.innerWidth, y: 10 }}
      >
        <Card style={{ width: 400 }}>
          <WindowHeader
            title="Item Browser"
            onChange={(hide: boolean) => setHideContent(hide)}
          />

          <Table hover style={HideStyle(hideContent)}>
            <thead>
              <th>Icon</th>
              <th>Name</th>
              <th>Type</th>
              <th>View on Market</th>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr id={i._id}>
                  <td>
                    <img src={`./icons/${i.market_name}.png`} height="25" />
                  </td>
                  <td>{i.name}</td>
                  <td>{i.type}</td>
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
    </div>
  );
}
