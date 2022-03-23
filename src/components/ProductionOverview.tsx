import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useContext, useEffect, useState } from "react";
import { Button, Card, ListGroup, Table } from "react-bootstrap";
import { useCustomEventListener } from "react-custom-events";
import Draggable from "react-draggable";
import { toast } from "react-toastify";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PlayerContext } from "../context/PlayerContext";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import {
  ElectricalPriceOverviewItem,
  Player,
  ProductionOverviewItem,
} from "../utils/interfaces";
import { Theme } from "../utils/Theme";

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
  const [electricalOverview, setElectricalOverview] =
    useState<ElectricalPriceOverviewItem>();
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
        ElectricalPriceOverview(playerId: $playerId) {
          producing
          consuming
          price
        }
      }
    `;

    client
      .query({
        query: query,
        variables: { playerId: playerId },
      })
      .then((res) => {
        let sorted = [...res.data.ProductionOverview];
        sorted.sort((a: ProductionOverviewItem, b: ProductionOverviewItem) =>
          a.item?.name.toUpperCase() < b.item?.name.toUpperCase() ? -1 : 1
        );
        setOverview(sorted);
        setCurrentPlayer(res.data.Players[0]);
        setElectricalOverview(res.data.ElectricalPriceOverview);
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
    if (props.playerId !== undefined && props.isOpen) {
      load(props.playerId);
    }
  }, [props.playerId, props.isOpen]);
  return (
    <Draggable
      axis="both"
      handle=".handle"
      bounds={{ top: 0 }}
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("productionOverview")}
      defaultPosition={{ x: 40, y: 10 }}
    >
      <Card style={{ width: 600, ...HideStyle(!props.isOpen) }}>
        <WindowHeader
          title={"Production Overview of " + currentPlayer?.display_name}
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
            View my production overview instead
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
          Money generation from structures: $
          {overview
            ?.filter((i) => i.item === null)
            .map((i) => i.producing)
            .reduce((p, c) => p + c, 0)}
        </p>
        {electricalOverview && (
          <>
            <h3 style={{ textAlign: "center" }}>
              Electricity Consumtion Overview
            </h3>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <ResponsiveContainer height={250} width="100%">
                <BarChart
                  width={400}
                  height={250}
                  data={[
                    {
                      name: "Electricity Produced",
                      value: electricalOverview.producing,
                    },
                    {
                      name: "Electricity Consumed",
                      value: -electricalOverview.consuming,
                    },
                    {
                      name: "Result",
                      value:
                        electricalOverview.producing -
                        electricalOverview.consuming,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Legend />

                  <Bar
                    isAnimationActive={false}
                    dataKey="value"
                    label={(entry) => entry.name}
                  >
                    <Cell fill={Theme.success} />
                    <Cell fill={"darkred"} />
                    <Cell
                      fill={
                        electricalOverview.producing -
                          electricalOverview.consuming >
                        0
                          ? Theme.success
                          : "darkred"
                      }
                    />
                  </Bar>
                  <Tooltip />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p style={{ marginLeft: 10, color: "darkgreen" }}>
              Electricity produced: {electricalOverview.producing} MW ($
              {electricalOverview.producing * electricalOverview.price})
            </p>
            <p style={{ marginLeft: 10, color: "darkred" }}>
              Electricity consumed: {electricalOverview.consuming} MW (-$
              {electricalOverview.consuming * electricalOverview.price})
            </p>
            <p
              style={{
                marginLeft: 10,
                color:
                  (electricalOverview.producing -
                    electricalOverview.consuming) *
                    electricalOverview.price >
                  0
                    ? "darkgreen"
                    : "darkred",
              }}
            >
              Net electricity: ($
              {(electricalOverview.producing - electricalOverview.consuming) *
                electricalOverview.price}
              )
            </p>
          </>
        )}
        <p style={{ marginLeft: 10 }}>
          These items will be produced every production month. One production
          month is 10 real-life minutes.
        </p>
      </Card>
    </Draggable>
  );
}
