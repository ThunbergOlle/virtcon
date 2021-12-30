import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import { useEffect, useState } from "react";
import { Button, Card } from "react-bootstrap";
import Draggable from "react-draggable";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import { Player } from "../utils/interfaces";
import { format } from "date-fns";
import WindowHeader from "./WindowHeader";
import AwardDisplayer from "./AwardDisplayer";
export default function ProfileViewer(props: {
  isOpen: boolean;
  className: string;
  playerId?: number;
  onViewPlayerInventory: (playerId: number) => void;
  onViewPlayerOverview: (playerId: number) => void;
  onBrowsePlayerPlots: (playerId: number) => void;
  onClose: () => void;
  onFocus: (windowType: WindowTypes) => void;
}) {
  const client = useApolloClient();
  const [player, setPlayer] = useState<Player>();
  const load = () => {
    const query = gql`
      query main($playerId: Int!) {
        Players(filter: { id: $playerId }) {
          id
          display_name
          last_login
          balance
          listings {
            id
            item {
              market_name
              name
            }
            isSellOrder
          }
          hasBlackMarketAccess
          awards {
            award {
              name
              color
            }
            amount
            timestamp
          }
        }
      }
    `;
    client
      .query({
        query: query,
        variables: { playerId: props.playerId },
      })
      .then((res) => {
        setPlayer(res.data.Players[0]);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  useEffect(() => {
    if (props.playerId) load();
  }, [props.playerId]);
  return (
    <Draggable
      axis="both"
      handle=".handle"
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("profileViewer")}
      defaultPosition={{ x: 40, y: 10 }}
    >
      <Card style={{ width: 600, ...HideStyle(!props.isOpen) }}>
        <WindowHeader title="Profile Viewer" onClose={() => props.onClose()} />
        {player ? (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexWrap: "wrap",
              flexDirection: "row",
            }}
          >
            <Card style={{ minWidth: "50%", flex: 1, minHeight: 300 }}>
              <Card.Body>
                <Card.Title>Overview of {player?.display_name}</Card.Title>
                <p>Balance: ${player?.balance}</p>
                <p>
                  Black Market Access: {String(player?.hasBlackMarketAccess)}
                </p>
                <p>
                  Last Seen:{" "}
                  {format(Number(player.last_login), "MM/dd/yyyy HH:mm")}
                </p>
                <p>
                  Awards:{" "}
                  {player.awards && player.awards?.length > 0 ? (
                    <>
                      {player.awards.map((a) => {
                        return (
                          <p>
                            <AwardDisplayer
                              keyId={String(a.id)}
                              key={a.id}
                              useBrackets
                              awards={[a]}
                            />
                            {" - Last Received: "}
                            {a.timestamp
                              ? format(Number(a.timestamp), "MM/dd/yyyy")
                              : "?"}
                          </p>
                        );
                      })}
                    </>
                  ) : (
                    "No awards..."
                  )}
                </p>
              </Card.Body>
            </Card>
            <Card style={{ minWidth: "50%", flex: 1, minHeight: 300 }}>
              <Card.Body>
                <Card.Title>In-depth analysis</Card.Title>
                <Button
                  style={{ marginBottom: 10 }}
                  onClick={() => props.onViewPlayerInventory(player.id)}
                >
                  View Inventory
                </Button>
                <Button
                  style={{ marginBottom: 10 }}
                  onClick={() => props.onViewPlayerOverview(player.id)}
                >
                  View Production Overview
                </Button>
                <Button
                  style={{ marginBottom: 10 }}
                  onClick={() => props.onBrowsePlayerPlots(player.id)}
                >
                  View Plots
                </Button>
              </Card.Body>
            </Card>
          </div>
        ) : null}
      </Card>
    </Draggable>
  );
}
