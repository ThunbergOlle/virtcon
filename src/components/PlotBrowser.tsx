import { useEffect, useState } from "react";
import { Button, Card, Table } from "react-bootstrap";
import Draggable from "react-draggable";
import { HideStyle } from "../utils/HideStyle";
import { IntrPlot } from "../utils/interfaces";
import BuildingBrowser from "./BuildingBrowser";
import WindowHeader from "./WindowHeader";
export default function PlotBrowser(props: {
  isOpen: boolean;
  plots: IntrPlot[];
}) {
  const [hideContent, setHideContent] = useState(false);
  const [plots, setPlots] = useState<IntrPlot[]>(props.plots);
  const [selectedPlot, setSelectedPlot] = useState<IntrPlot>();

  useEffect(() => {
    setPlots(props.plots);
  }, [props.plots]);
  return (
    <div style={HideStyle(!props.isOpen)}>
      <Draggable
        bounds="parent"
        axis="both"
        handle=".handle"
        defaultPosition={{ x: 100, y: 10 }}
      >
        <Card style={{ width: 600 }}>
          <WindowHeader
            title="Plot Browser"
            onChange={(hide: boolean) => setHideContent(hide)}
          />

          <Table hover style={HideStyle(hideContent)}>
            <thead>
              <th>Plot Number</th>
              <th>Buildings</th>
              <th>Materials</th>
              <th>View buildings</th>
            </thead>
            <tbody>
              {plots.map((p, index) => (
                <tr id={p._id}>
                  <td>{index}</td>
                  <td>
                    {p.buildings.length || 0} / {p.max_tiles}
                  </td>
                  <td>
                    {Array.from(new Set(p.raw_material_available)).toString()}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      style={{
                        height: 22,
                        margin: 0,
                        padding: 0,
                        width: "100%",
                      }}
                      onClick={() => setSelectedPlot(p)}
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
      <BuildingBrowser
        isOpen={props.isOpen && selectedPlot !== undefined}
        buildings={selectedPlot?.buildings}
        onClose={() => setSelectedPlot(undefined)}
      />
    </div>
  );
}
