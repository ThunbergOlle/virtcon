import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import { useContext, useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  InputGroup,
  Spinner,
  Table,
  Tooltip,
} from "react-bootstrap";
import Draggable from "react-draggable";
import { WindowTypes } from "../../pages/index/IndexPage";
import { HideStyle } from "../../utils/HideStyle";
import { Player, PlayerNetWorth } from "../../utils/interfaces";
import { format } from "date-fns";
import WindowHeader from "../WindowHeader";
import AwardDisplayer from "../AwardDisplayer";
import { PlayerContext } from "../../context/PlayerContext";
import { MoneyFormatter } from "../../utils/MoneyFormatter";
import { Theme, toast } from "react-toastify";
import { emitCustomEvent } from "react-custom-events";
import "./ProfileViewer.css";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function ProfileViewer(props: {
  isOpen: boolean;
  className: string;
  playerId?: number;
  onViewPlayerInventory: (playerId: number) => void;
  onViewPlayerOverview: (playerId: number) => void;
  onViewPlayerChart: (playerId: number) => void;
  onBrowsePlayerPlots: (playerId: number) => void;
  onViewPlayerBuilding: (playerId: number) => void;
  onClose: () => void;
  onFocus: (windowType: WindowTypes) => void;
}) {
  const client = useApolloClient();
  const [player, setPlayer] = useState<Player>();
  const [loading, setLoading] = useState<boolean>(false);
  const [playerNetWorth, setPlayerNetWorth] = useState<PlayerNetWorth>();
  const getPlayer = useContext(PlayerContext);
  const [transactionAmount, setTransactionAmount] = useState<string>();
  const makeTransaction = (playerId: number, amount: number) => {
    if (!playerId || !amount) return;
    const buyToast = toast.loading("Sending money...", { autoClose: 5000 });

    const mutation = gql`
      mutation makeTransaction($playerId: Int!, $amount: Int!) {
        MoneyTransaction(playerId: $playerId, amount: $amount) {
          success
          message
          balance_new
        }
      }
    `;
    client
      .mutate({
        mutation: mutation,
        variables: { playerId: playerId, amount: amount },
      })
      .then((res) => {
        if (res.data.MoneyTransaction.success) {
          toast.update(buyToast, {
            render:
              "Transfer successful. New balance: " +
              res.data.MoneyTransaction.balance_new,
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });
          emitCustomEvent("statListUpdate");
          load();
        } else {
          toast.update(buyToast, {
            render: res.data.MoneyTransaction.message,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
      })
      .catch((e) => {
        console.log(e);
        toast.update(buyToast, {
          render: "Transfer error. " + String(e),
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      });
  };
  const load = () => {
    setLoading(true);
    const query = gql`
      query loadProfileViewer($playerId: Int!, $relations: [String!]) {
        Players(filter: { id: $playerId }, relations: $relations) {
          id
          display_name
          last_login
          balance
          hasBlackMarketAccess
          awards {
            award {
              name
              color
            }
            amount
            timestamp
          }
          plot {
            id
          }
          sentTransactions {
            id
            amount
            fromPlayer {
              display_name
            }
            toPlayer {
              display_name
            }
            timestamp
          }
          receivedTransactions {
            id
            amount
            fromPlayer {
              display_name
            }
            toPlayer {
              display_name
            }
            timestamp
          }
        }
        PlayerNetWorth(playerId: $playerId) {
          netWorth
          stockPrice
        }
      }
    `;
    client
      .query({
        query: query,
        variables: {
          playerId: props.playerId,
          relations: [
            "awards",
            "awards.award",
            "plot",
            "sentTransactions",
            "sentTransactions.fromPlayer",
            "sentTransactions.toPlayer",
            "receivedTransactions",
            "receivedTransactions.fromPlayer",
            "receivedTransactions.toPlayer",
          ],
        },
      })
      .then((res) => {
        // Calculate the stocks that are not yet purchased from the company and give them to the currently displayed player
        let player: Player = res.data.Players[0];
        setPlayerNetWorth(res.data.PlayerNetWorth);
        setPlayer(player);
        setLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setLoading(false);
      });
  };
  useEffect(() => {
    if (props.playerId) load();
  }, [props.playerId, props.isOpen]);
  return (
    <Draggable
      axis="both"
      handle=".handle"
      bounds={{ top: 0 }}
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("profileViewer")}
      defaultPosition={{ x: 40, y: 10 }}
    >
      <Card style={{ width: 600, ...HideStyle(!props.isOpen) }}>
        <WindowHeader title="Profile Viewer" onClose={() => props.onClose()} />
        {player && !loading ? (
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
                <p>Balance: {MoneyFormatter.format(player?.balance)}</p>
                <p>
                  Net Worth:{" "}
                  {MoneyFormatter.format(playerNetWorth?.netWorth || 0)}
                </p>
                <p>
                  Stock price:{" "}
                  {MoneyFormatter.format(playerNetWorth?.stockPrice || 0)}
                </p>
                <p>Level (Plots): {player?.plot?.length}</p>
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
              <Card.Body className="in-depth-analysis">
                <Card.Title>In-depth analysis</Card.Title>
                <Button onClick={() => props.onViewPlayerInventory(player.id)}>
                  🎒 Inventory
                </Button>
                <Button onClick={() => props.onViewPlayerOverview(player.id)}>
                  🏭 Production Overview
                </Button>
                <Button onClick={() => props.onViewPlayerBuilding(player.id)}>
                  🏢 Building Overview
                </Button>
                <Button onClick={() => props.onBrowsePlayerPlots(player.id)}>
                  🏕 Plots
                </Button>
                <Button onClick={() => props.onViewPlayerChart(player.id)}>
                  📊 Holdings
                </Button>
              </Card.Body>
            </Card>
            <Card
              style={{
                minWidth: "100%",
                flex: 1,
                minHeight: 200,
                overflowY: "scroll",
                height: 200,
              }}
            >
              <Card.Body>
                <Card.Title>Transaction History</Card.Title>

                <Table hover striped>
                  <thead>
                    <th>Player</th>
                    <th>Timestamp</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </thead>
                  <tbody>
                    <>
                      {
                        /* använd useMemo på detta sen **/ player.sentTransactions
                          .concat(player.receivedTransactions)
                          .sort(
                            (a, b) => Number(b.timestamp) - Number(a.timestamp)
                          )
                          .map((transaction) => (
                            <tr style={{ cursor: "pointer" }}>
                              <td>
                                <p
                                  style={{
                                    display: "inline-block",
                                    marginLeft: 10,
                                    margin: 0,
                                    padding: 0,
                                  }}
                                >
                                  {transaction.fromPlayer.display_name} {"-->"}{" "}
                                  {transaction.toPlayer.display_name}
                                </p>
                              </td>
                              <td>
                                {" "}
                                {format(
                                  Number(transaction.timestamp),
                                  "MM/dd/yyyy HH:mm"
                                )}
                              </td>
                              <td
                                style={{
                                  textAlign: "right",
                                  fontFamily: "monospace",
                                  fontWeight: "bold",
                                }}
                              >
                                {MoneyFormatter.format(transaction.amount)}
                              </td>
                            </tr>
                          ))
                      }
                    </>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            <Card style={{ minWidth: "100%", flex: 1, minHeight: 200 }}>
              <Card.Body>
                <Card.Title>New Transaction</Card.Title>
                <Form.Label htmlFor="transaction">
                  Transaction Amount
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text id="dollarsign">$</InputGroup.Text>
                  <Form.Control
                    size="sm"
                    type="number"
                    id="transaction"
                    aria-describedby="dollarsign"
                    value={transactionAmount}
                    onChange={(e) => {
                      let val: number | undefined = Number(e.target.value);
                      if (val > Number(getPlayer.balance))
                        val = getPlayer.balance;
                      else if (val < 0) val = undefined;
                      setTransactionAmount(String(val));
                    }}
                  ></Form.Control>
                  <Form.Text className="text-muted">
                    By clicking "send" you will send the set amount to the
                    displayed player account. All transactions are public and
                    includes a fee of 5%.
                  </Form.Text>
                  <br />
                  <Button
                    size="sm"
                    style={{ float: "right" }}
                    onClick={() => {
                      if (props.playerId)
                        makeTransaction(player.id, Number(transactionAmount));
                    }}
                  >
                    Send
                  </Button>
                </InputGroup>
              </Card.Body>
            </Card>
          </div>
        ) : (
          <div style={{ textAlign: "center", margin: "auto", flex: 1 }}>
            <Spinner
              color={"darkgreen"}
              style={{ height: 100, width: 100 }}
              animation={"border"}
            />
            <p style={{ fontWeight: "bold" }}>Loading player profile... ⏳</p>
          </div>
        )}
      </Card>
    </Draggable>
  );
}
