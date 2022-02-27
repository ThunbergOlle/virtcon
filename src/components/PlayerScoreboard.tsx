import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useEffect, useState } from "react";
import { Button, Card, FormControl, Table } from "react-bootstrap";
import Draggable from "react-draggable";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import { Player } from "../utils/interfaces";
import WindowHeader from "./WindowHeader";
import { RiVipCrownFill } from "react-icons/ri";
import AwardDisplayer from "./AwardDisplayer";
import { MoneyFormatter } from "../utils/MoneyFormatter";

export default function PlayerScoreboard(props: {
  isOpen: boolean;
  onClose: Function;
  onFocus: (windowType: WindowTypes) => void;
  onPlayerClicked: (playerId: number) => void;
  className: string;
}) {
  const client = useApolloClient();
  const [players, setPlayer] = useState<Player[]>([]);
  const [searchPlayerValue, setSearchPlayerValue] = useState<string>("");
  const load = async () => {
    const query = gql`
      query loadPlayerScoreboard($display_name: String) {
        Players(
          filter: {
            order_by: balance
            descOrAsc: desc
            display_name: $display_name
          }
        ) {
          id
          display_name
          balance
          awards {
            id
            award {
              id
              name
              color
            }
            amount
          }
        }
      }
    `;

    let data = await client.query({
      query: query,
      variables: { display_name: searchPlayerValue },
    });
    setPlayer(data.data.Players);
    console.dir(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Draggable
      axis="both"
      handle=".handle"
      defaultPosition={{ x: 40, y: 10 }}
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("playerScoreboard")}
    >
      <Card
        style={{ width: 500, ...HideStyle(!props.isOpen), display: "flex" }}
      >
        <WindowHeader title="Scoreboard" onClose={() => props.onClose()} />
        <div
          style={{
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            flexDirection: "row",
          }}
        >
          <Card style={{ minWidth: "50%", flex: 1, minHeight: 180 }}>
            <Card.Body>
              <Card.Title>Player list</Card.Title>

              <input
                style={{ height: 35 }}
                value={searchPlayerValue}
                onChange={(e) => setSearchPlayerValue(e.target.value)}
                placeholder="Player name"
              />
              <Button style={{ height: 35 }} onClick={() => load()}>
                Find
              </Button>
              <Table hover striped>
                <thead>
                  <th>Player</th>
                  <th style={{ textAlign: "right" }}>Balance</th>
                </thead>
                <tbody>
                  {players.map((p) => {
                    return (
                      <tr
                        key={p.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => props.onPlayerClicked(p.id)}
                      >
                        <td>
                          {p.display_name}
                          <p
                            style={{
                              display: "inline-block",
                              marginLeft: 10,
                              margin: 0,
                              padding: 0,
                            }}
                          >
                            <AwardDisplayer
                              key={p.id + "awardDisplayer"}
                              keyId={String(p.id)}
                              awards={p.awards}
                              useBrackets
                            />
                          </p>
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontFamily: "monospace",
                            fontWeight: "bold",
                          }}
                        >
                          {MoneyFormatter.format(p.balance)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
      </Card>
    </Draggable>
  );
}
