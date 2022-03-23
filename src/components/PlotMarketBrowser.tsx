import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import { useEffect, useState } from "react";
import { Button, Card, Table } from "react-bootstrap";
import { useCustomEventListener } from "react-custom-events";
import Draggable from "react-draggable";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import { Plot } from "../utils/interfaces";
import { UniqueArrayToString } from "../utils/UniqueArrayToString";

import WindowHeader from "./WindowHeader";
export default function PlotMarketBrowser(props: {
  isOpen: boolean;
  className: string;
  onClose: () => void;
  onPlotClicked: (plot: Plot) => void;
  onFocus: (windowType: WindowTypes) => void;
}) {
  const [plots, setPlots] = useState<Plot[]>([]);
  const client = useApolloClient();

  const load = () => {
    const query = gql`
      query {
        Plot(filter: { isInteractive: false }) {
          id
          buildings {
            building {
              name
            }
          }
          resources {
            resource {
              name
              market_name
            }
          }
          askedPrice
        }
      }
    `;
    client
      .query({
        query: query,
      })
      .then((res) => {
        setPlots(res.data.Plot);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  useCustomEventListener("plotMarketUpdate", async () => {
    // När plot data har uppdaterats så ska vi hämta datan igen
    load();
  });
  useEffect(() => {
    if (props.isOpen) {
      load();
    }
  }, [props.isOpen]);
  return (
    <Draggable
      axis="both"
      handle=".handle"
      bounds={{ top: 0 }}
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("plotMarketBrowser")}
      defaultPosition={{ x: 40, y: 10 }}
    >
      <Card style={{ width: 600, ...HideStyle(!props.isOpen) }}>
        <WindowHeader title="Plot Market" onClose={() => props.onClose()} />

        <Table hover striped>
          <thead>
            <th>Id</th>
            <th>Buildings</th>
            <th>Material</th>
            <th>Price</th>
            <th style={{ width: 160 }}>Action</th>
          </thead>
          <tbody>
            {plots?.map((p) => (
              <tr key={p.id}>
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
                <td>{p.askedPrice}</td>
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
