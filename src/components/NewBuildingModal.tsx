import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useEffect, useState } from "react";
import { Button, Card, ListGroup, Table } from "react-bootstrap";
import Draggable from "react-draggable";
import { HideStyle } from "../utils/HideStyle";
import { IntrBuilding, IntrItem } from "../utils/interfaces";
import { Theme } from "../utils/Theme";
import WindowHeader from "./WindowHeader";
export default function NewBuildingModal(props: {
  isOpen: boolean;
  onClose: Function;
  onPlace: Function;
}) {
  const [hideContent, setHideContent] = useState(false);
  const [availableBuildings, setAvailableBuildings] = useState<IntrBuilding[]>(
    []
  );

  useEffect(() => {}, []);

  return (
    <div style={HideStyle(!props.isOpen)}>
      <Draggable
        bounds="parent"
        axis="both"
        defaultClassName=".absolute"
        handle=".handle"
        defaultPosition={{ x: 5, y: 10 }}
      >
        <Card style={{ width: 500 }}>
          <WindowHeader
            title="Select new building"
            onChange={(hide: boolean) => setHideContent(hide)}
            onClose={() => props.onClose()}
          />

          {!hideContent && (
            <>
              <div style={{ margin: 40 }}>
                <Button
                  size="sm"
                  style={{
                    height: 22,
                    margin: 0,
                    padding: 0,
                    marginBottom: 30,
                    display: "block",
                    width: 150,
                  }}
                >
                  Select
                </Button>
                <Button
                  size="sm"
                  style={{
                    height: 22,
                    margin: 0,
                    padding: 0,
                    width: 150,
                    display: "block",
                    backgroundColor: Theme.success,
                  }}
                >
                  Place
                </Button>
              </div>
            </>
          )}
        </Card>
      </Draggable>
    </div>
  );
}
