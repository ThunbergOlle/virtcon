import React, { useState } from "react";
import { Button, Card, ListGroup, Table } from "react-bootstrap";
import Draggable from "react-draggable";
export default function WindowHeader(props: {
  title: string;
  onChange?: Function;
  onClose?: Function;
}) {
  const [hideContent, setHideContent] = useState(false);
  return (
    <Card.Header className="handle">
      <div style={{ display: "flex" }}>
        <p style={{ flex: 1 }}>{props.title}</p>
        <div style={{ textAlign: "right" }}>
          {props.onChange !== undefined ? (
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
              onClick={() => {
                props.onChange!(!hideContent);
                setHideContent(!hideContent);
              }}
            >
              {hideContent ? "<" : "_"}
            </Button>
          ) : null}
          {props.onClose !== undefined && (
            <Button
              size="sm"
              style={{
                width: 20,
                height: 20,
                textAlign: "center",
                fontSize: 12,
                padding: 0,
                backgroundColor: "darkred",
                borderColor: "darkred",
              }}
              onClick={() => {
                if (props.onClose !== undefined) {
                  props.onClose();
                  setHideContent(!hideContent);
                }
              }}
            >
              X
            </Button>
          )}
        </div>
      </div>
    </Card.Header>
  );
}
