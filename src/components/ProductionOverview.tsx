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
import { ProductionOverviewItem } from "../utils/interfaces";

import WindowHeader from "./WindowHeader";
export default function ProductionOverview(props: {
  isOpen: boolean;
  className: string;
  onClose: () => void;
  onFocus: (windowType: WindowTypes) => void;
}) {
  const getPlayer = useContext(PlayerContext);
  const [overview, setOverview] = useState<ProductionOverviewItem[]>([]);
  const client = useApolloClient();
  const load = () => {
    const query = gql`
      query ProductionOverviewPurchase($filter: ProductionOverviewFilter) {
        ProductionOverview(filter: $filter) {
          item {
            id
            name
            market_name
            price
          }
          consuming
          producing
        }
      }
    `;

    client
      .query({
        query: query,
        variables: { filter: { playerId: getPlayer.id } },
      })
      .then((res) => {
        console.log(res.data);
        let sorted = [...res.data.ProductionOverview];
        sorted.sort((a: ProductionOverviewItem, b: ProductionOverviewItem) =>
          a.item?.name.toUpperCase() < b.item?.name.toUpperCase() ? -1 : 1
        );
        console.log(sorted);
        setOverview(sorted);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useCustomEventListener("productionOverviewUpdate", async (data) => {
    load();
  });
  useEffect(() => {
    if (getPlayer) {
      load();
    }
  }, [getPlayer]);
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
          title="Production Overview"
          onClose={() => props.onClose()}
        />

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
      </Card>
    </Draggable>
  );
}
