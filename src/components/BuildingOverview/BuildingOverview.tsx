import { useApolloClient, gql } from "@apollo/client";
import { useContext, useState, useEffect } from "react";
import { Card, Button, Table, Spinner } from "react-bootstrap";
import { emitCustomEvent, useCustomEventListener } from "react-custom-events";
import Draggable from "react-draggable";
import { PlayerContext } from "../../context/PlayerContext";
import { pickupBuilding } from "../../functions/PickupBuilding";
import { WindowTypes } from "../../pages/index/IndexPage";
import { HideStyle } from "../../utils/HideStyle";
import { Player } from "../../utils/interfaces";
import WindowHeader from "../WindowHeader";

interface CustomBuildingInterface {
  name: number;
  amount: number;
  plotBuildingIds: number[];
}
export default function BuildingOverview(props: {
  isOpen: boolean;
  className: string;
  onClose: () => void;
  onFocus: (windowType: WindowTypes) => void;
  playerId?: number;
}) {
  const getPlayer = useContext(PlayerContext);
  const [buildings, setBuildings] = useState<CustomBuildingInterface[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>();
  const [error, setError] = useState<string>("");
  const client = useApolloClient();
  const load = (playerId: number) => {
    setBuildings([]);
    setError("");
    const query = gql`
      query BuildingOverview($playerId: Int!) {
        BuildingOverview(playerId: $playerId) {
          name
          amount
          plotBuildingIds
        }
        Players(filter: { id: $playerId }) {
          id
          display_name
        }
      }
    `;

    client
      .query({
        query: query,
        variables: { playerId: playerId },
      })
      .then((res) => {
        // Change the building to fit the CustomBuildingInterface
        console.log(res);
        setCurrentPlayer(res.data.Players[0]);
        if (res.data.BuildingOverview && res.data.BuildingOverview.length > 0) {
          setBuildings(res.data.BuildingOverview);
        } else {
          setError("No buildings found");
        }
      })
      .catch((e) => {
        console.log(e);
        setError(e.message);
      });
  };
  const onBuildingPick = async (buildingIds: number[]) => {
    for (let i = 0; i < buildingIds.length; i++) {
      await pickupBuilding(buildingIds[i]);
    }
    if (currentPlayer) {
      load(currentPlayer.id);
      emitCustomEvent("productionOverviewUpdate");
      emitCustomEvent("backgroundUpdate");
      emitCustomEvent("selectedPlotUpdate");
    }
  };
  useCustomEventListener("buildingOverviewUpdate", async (data) => {
    if (currentPlayer) {
      load(currentPlayer.id);
    }
  });
  useEffect(() => {
    if (getPlayer && getPlayer.id) {
      load(getPlayer.id);
    }
  }, [getPlayer]);

  useEffect(() => {
    if (props.playerId !== undefined && props.isOpen) {
      console.log(props.playerId);
      load(props.playerId);
    }
  }, [props.playerId, props.isOpen]);
  return (
    <Draggable
      axis="both"
      handle=".handle"
      bounds={{ top: 0 }}
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("buildingOverview")}
      defaultPosition={{ x: 40, y: 10 }}
    >
      <Card style={{ width: 400, ...HideStyle(!props.isOpen) }}>
        <WindowHeader
          title={"Building overview of " + currentPlayer?.display_name}
          onRefresh={() => {
            if (currentPlayer) load(currentPlayer.id);
          }}
          onClose={() => props.onClose()}
        />
        {getPlayer.id && currentPlayer?.id !== getPlayer.id ? (
          <Button
            size="sm"
            onClick={() => {
              load(getPlayer!.id!);
            }}
            style={{ backgroundColor: "orange", borderColor: "orange" }}
          >
            View my building overview instead
          </Button>
        ) : null}
        <Table hover striped>
          {buildings.length > 0 ? (
            <>
              <thead>
                <th>Building Name</th>
                <th style={{ textAlign: "right" }}>Amount Placed</th>
                {/* Check if we are the player */}
                {getPlayer.id && currentPlayer?.id === getPlayer.id ? (
                  <th style={{ textAlign: "right" }}>Pickup (ALL)</th>
                ) : null}
              </thead>
              <tbody>
                {buildings?.map((building) => (
                  <tr key={building.name}>
                    <td>{building.name}</td>
                    <td style={{ textAlign: "right" }}>
                      {building.plotBuildingIds.length}
                    </td>
                    {getPlayer.id && currentPlayer?.id === getPlayer.id ? (
                      <td style={{ textAlign: "right" }}>
                        <Button
                          size="sm"
                          onClick={() =>
                            onBuildingPick(building.plotBuildingIds)
                          }
                        >
                          Pickup
                        </Button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </>
          ) : (
            <div style={{ textAlign: "center", margin: "auto", flex: 1 }}>
              <Spinner
                color={"darkgreen"}
                style={{ height: 100, width: 100 }}
                animation={"border"}
              />
              <p style={{ fontWeight: "bold" }}>
                Loading building overview... ⏳
              </p>
              <p style={{ fontWeight: "bold", color: "red" }}>{error}</p>
            </div>
          )}
        </Table>
      </Card>
    </Draggable>
  );
}
