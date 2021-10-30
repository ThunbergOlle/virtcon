import { useContext, useEffect, useState } from "react";
import { Button, Card, Table } from "react-bootstrap";
import Draggable from "react-draggable";
import { HideStyle } from "../utils/HideStyle";
import { Plot } from "../utils/interfaces";
import WindowHeader from "./WindowHeader";
import { useCustomEventListener } from "react-custom-events";
import { gql, useApolloClient } from "@apollo/client";
import { PlayerContext } from "../context/PlayerContext";
import { UniqueArrayToString } from "../utils/UniqueArrayToString";

export default function PlotBrowser(props: {
  isOpen: boolean;
  onPlotClicked: Function;
}) {
  const [hideContent, setHideContent] = useState(false);
  const [plots, setPlots] = useState<Plot[]>([]);
  const client = useApolloClient();
  const getPlayer = useContext(PlayerContext);

  const fetchPlotData = async () => {
    // Send PlotGRAPHQL Request
    const query = gql`
      query main($filter: PlotFilter) {
        Plot(filter: $filter) {
          id
          max_buildings
          buildings {
            building {
              name
            }
          }
          resources {
            resource {
              name
            }
          }
        }
      }
    `;
    console.log(getPlayer);
    if (getPlayer) {
      let data = await client.query({
        query: query,
        variables: { owner: getPlayer.id },
      });
      console.log(data.data.Plot);
      setPlots(data.data.Plot);
      return data.data.Plot;
    }
  };

  useCustomEventListener("plotUpdate", async (data) => {
    // När plot data har uppdaterats så ska vi hämta datan igen
    fetchPlotData();
  });
  useEffect(() => {
    fetchPlotData();
  }, []);
  return (
    <Draggable axis="both" handle=".handle" defaultPosition={{ x: 100, y: 10 }}>
      <Card style={{ width: 600, ...HideStyle(!props.isOpen) }}>
        <WindowHeader
          title="Plot Browser"
          onChange={(hide: boolean) => setHideContent(hide)}
        />

        <Table hover style={HideStyle(hideContent)}>
          <th>Id</th>
          <th>Buildings</th>
          <th>Materials</th>
          <th>View buildings</th>
          <tbody>
            {plots.map((p, index) => (
              <tr id={String(p.id)} key={p.id}>
                <td>{index}</td>
                <td>
                  {UniqueArrayToString(
                    p.buildings,
                    "No buildings",
                    "building",
                    "name"
                  )}
                </td>
                <td>
                  {UniqueArrayToString(
                    p.resources,
                    "No materials",
                    "resource",
                    "name"
                  )}
                </td>
                <td>
                  <Button
                    size="sm"
                    style={{
                      height: 22,
                      margin: 0,
                      padding: 0,
                      width: "100%",
                    }}
                    onClick={() => props.onPlotClicked(p)}
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
