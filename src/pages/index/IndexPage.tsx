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
import PlotViewer from "../../components/PlotViewer";
import PlotBrowser from "../../components/PlotBrowser";
import ServerShop from "../../components/ServerShop";
import StatList from "../../components/StatList";
import { PlayerContext } from "../../context/PlayerContext";
import { ValidateSession } from "../../functions/ValidateSession";
import { Player, Plot } from "../../utils/interfaces";
import { WindowStack } from "../../functions/WindowStack";

interface IndexPageProps {
  player: Player;
  client: ApolloClient<NormalizedCacheObject>;
}
export type WindowTypes =
  | "itemBrowser"
  | "serverShop"
  | "plotBrowser"
  | "plotViewer"
  | "buildingBrowser"
  | "inventory";
interface IndexPageState {
  player: Player;
  openWindows: {
    [key in WindowTypes]: boolean;
  };
  selectedPlot?: Plot;
  windowStack: WindowStack;
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
        plotViewer: false,
      },
      windowStack: new WindowStack(),
      selectedPlot: undefined,
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
    console.log("class:" + this.state.windowStack.getClass("inventory"));
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
            <ItemBrowser
              isOpen={this.state.openWindows.itemBrowser}
              onFocus={() => {
                this.state.windowStack.selectWindow("itemBrowser");
                this.forceUpdate();
              }}
              className={this.state.windowStack.getClass("itemBrowser")}
            />
            <Inventory
              isOpen={this.state.openWindows.inventory}
              onFocus={() => {
                this.state.windowStack.selectWindow("inventory");
                this.forceUpdate();
              }}
              className={this.state.windowStack.getClass("inventory")}
            />
            <PlotBrowser
              onFocus={() => {
                this.state.windowStack.selectWindow("plotBrowser");
                this.forceUpdate();
              }}
              className={this.state.windowStack.getClass("plotBrowser")}
              isOpen={this.state.openWindows.plotBrowser}
              onPlotClicked={(p: Plot) =>
                this.setState({
                  selectedPlot: p,
                  openWindows: {
                    ...this.state.openWindows,
                    plotViewer: true,
                  },
                })
              }
            />
            <PlotViewer
              onClose={() =>
                this.setState({
                  openWindows: {
                    ...this.state.openWindows,
                    plotViewer: false,
                  },
                })
              }
              isOpen={this.state.openWindows.plotViewer}
              selectedPlotId={this.state.selectedPlot?.id}
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
