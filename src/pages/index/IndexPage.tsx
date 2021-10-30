import {
  ApolloClient,
  NormalizedCache,
  NormalizedCacheObject,
} from "@apollo/client";
import React from "react";
import { emitCustomEvent } from "react-custom-events";
import Draggable from "react-draggable";
import { toast } from "react-toastify";
import ActionBar from "../../components/ActionBar";
import BuildingBrowser from "../../components/BuildingBrowser";
import Inventory from "../../components/Inventory";
import ItemBrowser from "../../components/ItemBrowser";
import PlotBrowser from "../../components/PlotBrowser";
import ServerShop from "../../components/ServerShop";
import StatList from "../../components/StatList";
import { PlayerContext } from "../../context/PlayerContext";
import { ValidateSession } from "../../functions/ValidateSession";
import { Player, Plot } from "../../utils/interfaces";

interface IndexPageProps {
  player: Player;
  client: ApolloClient<NormalizedCacheObject>;
}
export type WindowTypes =
  | "itemBrowser"
  | "serverShop"
  | "plotBrowser"
  | "buildingBrowser"
  | "inventory";
interface IndexPageState {
  player: Player;
  openWindows: {
    [key in WindowTypes]: boolean;
  };
  buildingBrowserPlot?: Plot;
}

export default class IndexPage extends React.Component<
  IndexPageProps,
  IndexPageState
> {
  constructor(props: IndexPageProps) {
    super(props);
    this.state = {
      player: this.props.player,
      openWindows: {
        itemBrowser: false,
        serverShop: false,
        plotBrowser: false,
        buildingBrowser: false,
        inventory: false,
      },
      buildingBrowserPlot: undefined,
    };
  }
  updatePlayer() {
    ValidateSession(this.props.client)
      .then((player) => {
        console.log(player);
        this.setState({ player: player });
      })
      .catch((e) => {
        toast("Error fetching user", { type: "error" });
      });
  }
  render() {
    console.log(this.state.openWindows.serverShop);
    return (
      <>
        <PlayerContext.Provider value={this.state.player}>
          <ActionBar
            onWindowOpened={(window) => {
              this.setState({
                openWindows: {
                  ...this.state.openWindows,
                  [window]: !this.state.openWindows[window],
                },
              });
            }}
          />
          <div
            style={{
              position: "relative",
              width: window.innerWidth - 10,
              height: window.innerHeight,
            }}
          >
            <StatList balance={this.state.player.balance} />
            <ItemBrowser isOpen={this.state.openWindows.itemBrowser} />
            <Inventory isOpen={this.state.openWindows.inventory} />
            <PlotBrowser
              isOpen={this.state.openWindows.plotBrowser}
              onPlotClicked={(p: Plot) =>
                this.setState({
                  buildingBrowserPlot: p,
                  openWindows: {
                    ...this.state.openWindows,
                    buildingBrowser: true,
                  },
                })
              }
            />
            <BuildingBrowser
              isOpen={
                this.state.openWindows.buildingBrowser &&
                this.state.buildingBrowserPlot !== undefined
              }
              onClose={() =>
                this.setState({
                  openWindows: {
                    ...this.state.openWindows,
                    buildingBrowser: false,
                  },
                })
              }
              plot={this.state.buildingBrowserPlot}
            />
            <ServerShop
              isOpen={this.state.openWindows.serverShop}
              onPurchase={() => emitCustomEvent("plotUpdate")}
            />
          </div>
        </PlayerContext.Provider>
      </>
    );
  }
}
