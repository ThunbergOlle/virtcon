import React, { useState } from "react";
import { Button, Card, ListGroup, Table } from "react-bootstrap";
import Draggable from "react-draggable";
import { HideStyle } from "../utils/HideStyle";
export default function StatList(props: { balance: number }) {
  const [hideContent, setHideContent] = useState(false);
  return (
    <Draggable
      bounds="parent"
      axis="both"
      handle=".handle"
      defaultPosition={{ x: window.innerWidth - 250, y: 10 }}
    >
      <Card style={{ width: 200 }}>
        <Card.Header className="handle">
          <div style={{ display: "flex" }}>
            <p style={{ flex: 1 }}>My statistics</p>
            <div style={{ textAlign: "right" }}>
              <Button
                size="sm"
                style={{
                  width: 20,
                  height: 20,
                  textAlign: "center",
                  fontSize: 12,
                  padding: 0,
                  backgroundColor: "gray",
                }}
                onClick={() => setHideContent(!hideContent)}
              >
                {hideContent ? "<" : "x"}
              </Button>
            </div>
          </div>
        </Card.Header>

        <Table hover style={HideStyle(hideContent)}>
          <tbody>
            <tr>
              <td>Balance</td>
              <td style={{ textAlign: "right" }}>{props.balance}</td>
            </tr>
          </tbody>
        </Table>
      </Card>
    </Draggable>
  );
}
