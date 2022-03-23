import { useContext, useEffect, useState } from "react";
import { Button, Card, Table } from "react-bootstrap";
import Draggable from "react-draggable";
import { HideStyle } from "../utils/HideStyle";
import { Player, Plot } from "../utils/interfaces";
import WindowHeader from "./WindowHeader";
import { useCustomEventListener } from "react-custom-events";
import { gql, useApolloClient } from "@apollo/client";
import { PlayerContext } from "../context/PlayerContext";
import { UniqueArrayToString } from "../utils/UniqueArrayToString";
import { WindowTypes } from "../pages/index/IndexPage";

export default function PlotBrowser(props: {
  isOpen: boolean;
  className: string;
  onFocus: (windowType: WindowTypes) => void;
  onClose: () => void;
  playerId?: number;
  onPlotClicked: Function;
}) {
  const [hideContent, setHideContent] = useState(false);
  const [plots, setPlots] = useState<Plot[]>([]);
  const client = useApolloClient();
  const [loadedPlayer, setLoadedPlayer] = useState<Player>();
  const getPlayer = useContext(PlayerContext);

  const load = async (playerId: number) => {
    // Send PlotGRAPHQL Request
    const query = gql`
      query loadPlotBrowser($playerId: Int!) {
        Plot(filter: { owner: $playerId }) {
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
        Players(filter: { id: $playerId }) {
          display_name
          id
        }
      }
    `;
    if (getPlayer) {
      let data = await client.query({
        query: query,
        variables: { playerId: playerId },
      });
      setPlots(data.data.Plot);
      setLoadedPlayer(data.data.Players[0]);
      return data.data.Plot;
    }
  };

  useCustomEventListener("plotUpdate", async (data) => {
    // När plot data har uppdaterats så ska vi hämta datan igen
    if (getPlayer.id && loadedPlayer?.id && loadedPlayer?.id === getPlayer.id) {
      load(getPlayer.id);
    }
  });
  useEffect(() => {
    if (props.playerId) {
      load(props.playerId);
    }
  }, [props.playerId]);
  useEffect(() => {
    if (getPlayer.id) {
      load(getPlayer.id);
    }
  }, []);
  return (
    <Draggable
      axis="both"
      handle=".handle"
      bounds={{ top: 0 }}
      defaultPosition={{ x: 100, y: 10 }}
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("plotBrowser")}
    >
      <Card style={{ width: 850, ...HideStyle(!props.isOpen) }}>
        <WindowHeader
          title={
            "Plot Browser of player: " +
            (loadedPlayer?.display_name || getPlayer.display_name)
          }
          onClose={() => props.onClose()}
        />
        {getPlayer.id &&
        loadedPlayer?.id &&
        loadedPlayer.id !== getPlayer.id ? (
          <Button
            size="sm"
            onClick={() => {
              load(getPlayer!.id!);
            }}
            style={{ backgroundColor: "orange", borderColor: "orange" }}
          >
            View my plots instead
          </Button>
        ) : null}
        <Table hover striped style={HideStyle(hideContent)}>
          <th>#</th>
          <th>Buildings</th>
          <th>Materials</th>
          <th>View plot</th>
          <tbody>
            {plots.map((p, index) => (
              <tr id={String(p.id)} key={p.id}>
                <td>{p.id}</td>
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
