import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useContext, useEffect, useState } from "react";
import { Button, Card, ListGroup, Table } from "react-bootstrap";
import { useCustomEventListener } from "react-custom-events";
import Draggable from "react-draggable";
import { toast } from "react-toastify";
import { PlayerContext } from "../context/PlayerContext";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import { Player, ProductionOverviewItem } from "../utils/interfaces";

import WindowHeader from "./WindowHeader";
export default function ProductionOverview(props: {
  isOpen: boolean;
  className: string;
  onClose: () => void;
  onFocus: (windowType: WindowTypes) => void;
  playerId?: number;
}) {
  const getPlayer = useContext(PlayerContext);
  const [overview, setOverview] = useState<ProductionOverviewItem[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>();
  const client = useApolloClient();
  const load = (playerId: number) => {
    const query = gql`
      query ProductionOverviewPurchase($playerId: Int) {
        ProductionOverview(filter: { playerId: $playerId }) {
          item {
            id
            name
            market_name
            price
          }
          consuming
          producing
        }
        Players(filter: { id: $playerId }) {
          display_name
          id
        }
      }
    `;

    client
      .query({
        query: query,
        variables: { playerId: playerId },
      })
      .then((res) => {
        console.log(res.data);
        let sorted = [...res.data.ProductionOverview];
        sorted.sort((a: ProductionOverviewItem, b: ProductionOverviewItem) =>
          a.item?.name.toUpperCase() < b.item?.name.toUpperCase() ? -1 : 1
        );
        console.log(sorted);
        setOverview(sorted);
        setCurrentPlayer(res.data.Players[0]);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useCustomEventListener("productionOverviewUpdate", async (data) => {
    if (currentPlayer && currentPlayer.id === getPlayer.id) {
      load(currentPlayer.id);
    }
  });
  useEffect(() => {
    if (getPlayer && getPlayer.id) {
      load(getPlayer.id);
    }
  }, [getPlayer]);

  useEffect(() => {
    if (props.playerId !== undefined) {
      load(props.playerId);
    }
  }, [props.playerId]);
  return (
    <Draggable
      axis="both"
      handle=".handle"
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("productionOverview")}
      defaultPosition={{ x: 40, y: 10 }}
    >
      <Card style={{ width: 600, ...HideStyle(!props.isOpen) }}>
        <WindowHeader
          title={"Production Overview of " + currentPlayer?.display_name}
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
            View my inventory instead
          </Button>
        ) : null}
        <Table hover striped>
          <thead>
            <th>Icon</th>
            <th>Item</th>
            <th style={{ textAlign: "right" }}>Consuming</th>
            <th style={{ textAlign: "right" }}>Producing</th>
            <th style={{ textAlign: "right" }}>Net</th>
          </thead>
          <tbody>
            {overview.map((i) => {
              const net = i.producing - i.consuming;
              return i.item ? (
                <tr key={i.item.id}>
                  <td>
                    <img
                      src={`./icons/${i.item.market_name}.png`}
                      height="25"
                    />
                  </td>
                  <td>{i.item.name}</td>
                  <td style={{ textAlign: "right" }}>{i.consuming}</td>
                  <td style={{ textAlign: "right" }}>{i.producing}</td>
                  <td
                    style={{
                      margin: 0,
                      padding: 0,
                      textAlign: "right",
                      color: net < 0 ? "red" : "green",
                    }}
                  >
                    {net > 0 && "+"}
                    {net}
                  </td>
                </tr>
              ) : null;
            })}
          </tbody>
        </Table>
        <p style={{ marginLeft: 10 }}>
          Total money generation: $
          {overview
            .filter((i) => i.item === null)
            .map((i) => i.producing)
            .reduce((p, c) => p + c, 0)}
        </p>
        <p style={{ marginLeft: 10 }}>
          These items will be produced every production month. One production
          month is 10 real-life minutes.
        </p>
      </Card>
    </Draggable>
  );
}
