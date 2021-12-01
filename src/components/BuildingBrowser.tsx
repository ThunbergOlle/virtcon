import { gql, useApolloClient } from "@apollo/client";
import { useEffect, useState } from "react";
import { Button, Card, Table } from "react-bootstrap";
import { emitCustomEvent, useCustomEventListener } from "react-custom-events";
import Draggable from "react-draggable";
import { pickupBuilding } from "../functions/PickupBuilding";
import { HideStyle } from "../utils/HideStyle";
import { Plot, PlotBuildings } from "../utils/interfaces";
import WindowHeader from "./WindowHeader";
export default function BuildingBrowser(props: {
  isOpen: boolean;
  onClose: Function;
  plot?: Plot;
}) {
  const [hideContent, setHideContent] = useState(false);
  const [buildings, setBuildings] = useState<PlotBuildings[]>([]);
  const client = useApolloClient();

  const fetchBuildingData = async () => {
    // Send PlotGRAPHQL Request
    const query = gql`
      query main($filter: PlotBuildingsFilter) {
        PlotBuildings(filter: $filter) {
          id
          building {
            id
            name
            consumes_amount
            consumesItem {
              name
            }
            outputItem {
              name
            }
          }
          occupiesResource {
            resource {
              name
            }
          }
        }
      }
    `;
    console.log(props.plot?.id);
    let data = await client.query({
      query: query,
      variables: { filter: { plot: props.plot?.id } },
    });
    console.log(data.data.PlotBuildings);
    setBuildings(data.data.PlotBuildings);
    return data.data.PlotBuildings;
  };
  useCustomEventListener("plotBuildingsUpdate", async () => {
    // När plot data har uppdaterats så ska vi hämta datan igen
    fetchBuildingData();
  });
  useEffect(() => {
    console.log(props.plot?.id);
    fetchBuildingData();
  }, [props.plot]);
  if (props.isOpen) {
    return (
      <Draggable axis="both" handle=".handle" defaultPosition={{ x: 5, y: 10 }}>
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
                onClick={() => console.log(true)}
              >
                New Building
              </Button>
            </div>
            <Table hover striped>
              <th>Icon</th>
              <th>Name</th>
              <th>Consumes</th>
              <th>Genereates</th>
              <th>Takes resource</th>
              <th>Action</th>

              <tbody>
                {buildings?.map((b) => (
                  <tr id={String(b.id)} key={b.id}>
                    <td>
                      <img src={`./icons/${b.building}.png`} height="25" />
                    </td>
                    <td>{b.building?.name}</td>
                    <td>
                      {/** b.building.consumesItem?.name*/} x
                      {/** b.building?.consumes_amount*/}
                    </td>
                    <td>{b.building?.outputItem?.name}</td>
                    <td>{b.occupiesResource?.resource?.name}</td>
                    <td>
                      <Button
                        size="sm"
                        style={{
                          height: 22,
                          margin: 0,
                          padding: 0,
                          width: "100%",
                        }}
                        onClick={() => {
                          pickupBuilding(b.id).then(() => fetchBuildingData());
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
    );
  } else return null;
}
/*
 <NewBuildingModal
          isOpen={isNewBuildingModalOpen}
          onClose={() => setIsNewBuildingModalOpen(false)}
          onPlace={() => console.log("tmp: placed")}
        />
        */
