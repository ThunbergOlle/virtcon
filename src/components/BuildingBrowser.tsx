import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useEffect, useState } from "react";
import { Button, Card, ListGroup, Table } from "react-bootstrap";
import Draggable from "react-draggable";
import { HideStyle } from "../utils/HideStyle";
import { IntrBuilding, IntrItem } from "../utils/interfaces";
import NewBuildingModal from "./NewBuildingModal";
import WindowHeader from "./WindowHeader";
export default function BuildingBrowser(props: {
  isOpen: boolean;
  onClose: Function;
  buildings?: IntrBuilding[];
}) {
  const [hideContent, setHideContent] = useState(false);
  const [buildings, setBuildings] = useState<IntrBuilding[]>([]);
  const [isNewBuildingModalOpen, setIsNewBuildingModalOpen] =
    useState<boolean>(false);

  useEffect(() => {
    setBuildings(props.buildings || []);
  }, [props.buildings]);
  if (!props.buildings) return <></>;
  if (props.isOpen) {
    return (
      <>
        <Draggable
          bounds="parent"
          axis="both"
          handle=".handle"
          defaultPosition={{ x: 5, y: 10 }}
        >
          <Card style={{ width: 1000 }}>
            <WindowHeader
              title="Building viewer"
              onChange={(hide: boolean) => setHideContent(hide)}
              onClose={() => props.onClose()}
            />

            <div style={HideStyle(hideContent)}>
              <div>
                <Button
                  size="sm"
                  style={{
                    height: 22,
                    margin: 0,
                    padding: 0,
                    width: 150,
                    float: "right",
                  }}
                  onClick={() => setIsNewBuildingModalOpen(true)}
                >
                  New Building
                </Button>
              </div>
              <Table hover>
                <thead>
                  <th>Icon</th>
                  <th>Name</th>
                  <th>Consumes</th>
                  <th>Genereates</th>
                  <th>Takes resource</th>
                  <th>Action</th>
                </thead>
                <tbody>
                  {buildings.map((b) => (
                    <tr id={b._id}>
                      <td>
                        <img src={`./icons/${b.building}.png`} height="25" />
                      </td>
                      <td>{b.building}</td>
                      <td>
                        {b.consumesPerHour} {b.consumes}
                      </td>
                      <td>
                        {b.generatesPerHour} {b.generates}
                      </td>
                      <td>{b.material_name}</td>
                      <td>
                        <Button
                          size="sm"
                          style={{
                            height: 22,
                            margin: 0,
                            padding: 0,
                            width: "100%",
                          }}
                        >
                          Pickup
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>
        </Draggable>
        <NewBuildingModal
          isOpen={isNewBuildingModalOpen}
          onClose={() => setIsNewBuildingModalOpen(false)}
          onPlace={() => console.log("tmp: placed")}
        />
      </>
    );
  } else return <></>;
}
