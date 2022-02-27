import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import { useContext, useEffect, useState } from "react";
import { Plot } from "../utils/interfaces";
import { PlayerContext } from "../context/PlayerContext";
import Map from "./Map";
import "./PlotOverviewBackground.css";
import { useCustomEventListener } from "react-custom-events";
import { Spinner } from "react-bootstrap";
import { Theme } from "../utils/Theme";
export default function PlotOverviewBackground(props: {
  onSelectedPlot: (plotId: number) => void;
}) {
  const [plots, setPlots] = useState<Plot[]>([]);
  const client = useApolloClient();
  const getPlayer = useContext(PlayerContext);
  const fetchPlotData = async () => {
    const query = gql`
      query fetchPlotData($owner: Int) {
        Plot(filter: { owner: $owner }) {
          id
          grid {
            x
            y
            id
            height
            resource {
              resource {
                name
                market_name
              }
              amount
              amountUsed
            }
            building {
              id
              building {
                name
                outputItem {
                  market_name
                }
                electricityGenerated
                output_amount
              }
            }
          }
        }
      }
    `;

    let data = await client.query({
      query: query,
      variables: { owner: getPlayer.id },
    });
    console.dir(data);
    setPlots(data.data.Plot);
  };
  useCustomEventListener("backgroundUpdate", fetchPlotData);
  useEffect(() => {
    fetchPlotData();
  }, [getPlayer.id]);
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "row",
        alignContent: "center",
        width: "100%",
      }}
    >
      {plots.length > 0 ? (
        plots.map((p) => (
          <div className="map-container">
            <Map
              plotId={p.id}
              width={(0.2 / 8) * window.innerWidth - 1}
              rowSize={8}
              grid={p.grid || []}
              onMapClicked={props.onSelectedPlot}
            />
          </div>
        ))
      ) : (
        <div style={{ textAlign: "center", margin: "auto", flex: 1 }}>
          <Spinner
            color={Theme.primary}
            style={{ height: 100, width: 100 }}
            animation={"border"}
          />
          <p style={{ fontWeight: "bold" }}>Loading plots... 😴</p>
        </div>
      )}
    </div>
  );
}
