import { gql, useApolloClient } from "@apollo/client";
import { useContext, useEffect, useState } from "react";
import { Button, Card, Tooltip } from "react-bootstrap";
import Draggable from "react-draggable";
import { toast } from "react-toastify";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { PlayerContext } from "../context/PlayerContext";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import { Player, PlayerNetWorth, PlayerStocks } from "../utils/interfaces";
import { MoneyFormatter } from "../utils/MoneyFormatter";
import WindowHeader from "./WindowHeader";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
export default function ChartViewer(props: {
  isOpen: boolean;
  className: string;
  playerId?: number;
  onClose: () => void;
  onFocus: (windowTypec: WindowTypes) => void;
}) {
  const client = useApolloClient();
  const [playerNetWorth, setPlayerNetWorth] = useState<PlayerNetWorth>();
  const [playerSoldStocks, setPlayerSoldStocks] = useState<PlayerStocks[]>([]);
  const getPlayer = useContext(PlayerContext);
  const [player, setPlayer] = useState<Player>();
  const load = () => {
    const query = gql`
      query loadChartViewer($playerId: Int!) {
        PlayerNetWorth(playerId: $playerId) {
          netWorth
          inventoryWorth
          balance
          stockPrice
          netWorthInTypes {
            value
            type
          }
        }
      }
    `;
    client
      .query({
        query: query,
        variables: {
          playerId: props.playerId,
          // relations: ["soldStocks", "soldStocks.owner", "plot"],
        },
      })
      .then((res) => {
        // Calculate the stocks that are not yet purchased from the company and give them to the currently displayed player
        let soldStocks: PlayerStocks[] = res.data.Players[0].soldStocks;

        const stocksLeft =
          soldStocks.length > 0
            ? 100 -
              soldStocks
                .map((s) => s.amount)
                .reduce((prev, next) => prev + next)
            : 100;
        const currentPlayerSmall: any = {
          display_name: res.data.Players[0].display_name,
        };
        soldStocks.push({
          owner: currentPlayerSmall,
          id: -1,
          amount: stocksLeft,
          timestamp: new Date(),
          pricePerStock: 0,
          stocksOf: currentPlayerSmall,
        });

        setPlayerNetWorth(res.data.PlayerNetWorth);
        setPlayerSoldStocks(soldStocks);
        setPlayer(res.data.Players[0]);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const playerAcquirePrompt = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to acquire this player?\n\nThis will remove the player from the market and tranfer all it's assets to your account.\n\nThis action is irreversible and will force the player start over."
    );
    if (!isConfirmed) return;
    // Lägg ut ploten på marknaden.
    const buyToast = toast.loading(
      "Sending request to transfer ownership of assets...",
      { autoClose: 5000 }
    );
    //do something else
    const mutation = gql`
      mutation playerAcquirePrompt($playerId: Int!) {
        PlayerAcquire(playerId: $playerId) {
          success
        }
      }
    `;

    client
      .mutate({
        mutation: mutation,
        variables: { playerId: props.playerId },
      })
      .then((res) => {
        if (res.data.PlayerAcquire) {
          toast.update(buyToast, {
            render:
              "Successfully acquired player and transferred it's assets to your account!",
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });

          props.onClose();
        } else if (res.errors) {
          toast.update(buyToast, {
            render: "Acquisition denied: " + res.errors[0].message,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        } else {
          toast.update(buyToast, {
            render: "Acquisition denied",
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const buyStockPrompt = async () => {
    const quantity = parseInt(
      (await prompt("How many stocks would you like to buy?", "0")) || ""
    );
    const isConfirmed = window.confirm(
      "Are you sure you want to purchase stocks worth " +
        MoneyFormatter.format((playerNetWorth?.stockPrice || 0) * quantity) +
        "?"
    );
    if (!isConfirmed) return;
    if (!quantity) return;
    // Lägg ut ploten på marknaden.
    const buyToast = toast.loading("Sending buy order...", { autoClose: 5000 });
    //do something else
    const mutation = gql`
      mutation buyStockPrompt($playerId: Int!, $quantity: Int!) {
        PlayerStockPurchase(playerId: $playerId, quantity: $quantity) {
          success
        }
      }
    `;

    client
      .mutate({
        mutation: mutation,
        variables: { playerId: props.playerId, quantity: quantity },
      })
      .then((res) => {
        if (res.data.PlayerStockPurchase?.success) {
          toast.update(buyToast, {
            render: "Stock purchase successful!",
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });

          load();
        } else if (res.errors) {
          toast.update(buyToast, {
            render: "Stock purchase denied: " + res.errors[0].message,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        } else {
          toast.update(buyToast, {
            render: "Stock purchase denied",
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };
  useEffect(() => {
    if (props.isOpen && props.playerId) {
      load();
    }
  }, [props.playerId, props.isOpen]);
  return (
    <Draggable
      axis="both"
      handle=".handle"
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("chartViewer")}
      defaultPosition={{ x: 40, y: 10 }}
    >
      <Card style={{ width: 600, ...HideStyle(!props.isOpen) }}>
        <WindowHeader title="Chart Viewer" onClose={() => props.onClose()} />

        <Card
          style={{
            minWidth: "100%",
            flex: 1,
            minHeight: 250,
          }}
        >
          <Card.Title style={{ textAlign: "center" }}>
            Investments of {player?.display_name}
          </Card.Title>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <ResponsiveContainer height={250} width="100%">
              <PieChart width={400} height={400}>
                <Pie
                  data={playerNetWorth?.netWorthInTypes}
                  isAnimationActive={false}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="type"
                  label={(entry) =>
                    entry.type + ": " + MoneyFormatter.format(entry.value)
                  }
                >
                  {playerNetWorth?.netWorthInTypes.map((entry, index) => (
                    <Cell
                      key={`cell-${index}-netWorthInTypes`}
                      fill={COLORS[index % COLORS.length]}
                      name={entry.type}
                    />
                  ))}
                  <Tooltip />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        {playerSoldStocks.length > 0 ? (
          <Card
            style={{
              maxWidth: "100%",
              flex: 1,
              minHeight: 250,
            }}
          >
            <Card.Title style={{ textAlign: "center" }}>
              {" "}
              Stocks of {player?.display_name}{" "}
            </Card.Title>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <ResponsiveContainer height={250} width="100%">
                <PieChart width={400} height={400}>
                  <Pie
                    data={playerSoldStocks}
                    isAnimationActive={false}
                    label={(entry) =>
                      entry.owner.display_name + ": " + entry.amount + "%"
                    }
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey={"amount"}
                  >
                    {playerSoldStocks.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p style={{ textAlign: "center" }}>
              Stock price:{" "}
              {MoneyFormatter.format(playerNetWorth?.stockPrice || 0)}
            </p>
            <p style={{ textAlign: "center" }} className="text-muted">
              *You can only buy stock from players that are in the same level or
              a higher level than you are in. You have a purchasing limit of{" "}
              {MoneyFormatter.format(
                (getPlayer.balance || 0) - (getPlayer.giftedBalance || 0)
              )}{" "}
              based off your transaction history*
            </p>
            <Button
              onClick={buyStockPrompt}
              disabled={
                (getPlayer?.plot?.length || 0) > (player?.plot?.length || 0) ||
                false
              }
            >
              Buy stock of this player
            </Button>
          </Card>
        ) : null}
      </Card>
    </Draggable>
  );
}
