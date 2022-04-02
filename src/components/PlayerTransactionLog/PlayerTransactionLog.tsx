import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import { useContext, useEffect, useState } from "react";
import { Card, Table } from "react-bootstrap";
import Draggable from "react-draggable";
import { PlayerContext } from "../../context/PlayerContext";
import { WindowTypes } from "../../pages/index/IndexPage";
import { HideStyle } from "../../utils/HideStyle";
import { PlayerTransactionLog as IntrPlayerTransactionLog } from "../../utils/interfaces";
import { MoneyFormatterLong } from "../../utils/MoneyFormatter";
import WindowHeader from "../WindowHeader";

export default function PlayerTransactionLog(props: {
  isOpen: boolean;
  className: string;
  onFocus: (windowType: WindowTypes) => void;
  onClose: (windowType: WindowTypes) => void;
}) {
  let timer: any;
  const player = useContext(PlayerContext);
  const client = useApolloClient();
  const [log, setLog] = useState<IntrPlayerTransactionLog[]>([]);
  const load = (playerId: number) => {
    if (!timer) {
      const logPolling = () => {
        const query = gql`
          query PlayerTransactionLog($playerId: Int!, $limit: Int!) {
            PlayerTransactionLog(playerId: $playerId, limit: $limit) {
              id
              timestamp
              description
              type
              amount
            }
          }
        `;
        client
          .query({
            query: query,
            variables: { playerId: playerId, limit: 50 },
          })
          .then((res) => {
            const log = res.data.PlayerTransactionLog;
            if (log.length > 0) {
              setLog(log);
            }
          })
          .catch((e) => {
            console.log(e);
          });
      };
      logPolling();
      timer = setInterval(logPolling, 3000);
    }
  };
  useEffect(() => {
    if (props.isOpen && player && player.id) {
      load(player.id);
    }
    return () => clearInterval(timer);
  }, [props.isOpen, player]);

  return (
    <Draggable
      axis="both"
      handle=".handle"
      bounds={{ top: 0 }}
      defaultPosition={{ x: 40, y: 10 }}
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("playerTransactionLog")}
    >
      <Card style={{ width: 500, ...HideStyle(!props.isOpen) }}>
        <WindowHeader
          title="Transaction Log"
          onClose={() => props.onClose("playerTransactionLog")}
          onRefresh={() => (player && player.id ? load(player.id) : null)}
        />
        <div
          style={{
            overflowY: "scroll",
            display: "flex",
            flexDirection: "column",
            height: 400,
          }}
        >
          <Table hover>
            <thead>
              <th>Type</th>
              <th>Description</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </thead>
            <tbody>
              {log.map((i) => (
                <tr id={String(i.id)} key={i.id}>
                  <td>
                    {/* If the type is "money" use the money icon */}
                    {i.type?.includes("money") ? (
                      <img src={"/icons/money.png"} height={32} />
                    ) : null}
                    {i.type === "production" ? (
                      <img src={"/icons/factory.png"} height={32} />
                    ) : null}
                  </td>
                  <td>{i.description}</td>
                  <td
                    style={{
                      textAlign: "right",
                      color: i.amount < 0 ? "red" : "green",
                    }}
                  >
                    {MoneyFormatterLong.format(i.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </Draggable>
  );
}
