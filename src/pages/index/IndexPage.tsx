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
import MarketBrowser from "../../components/Market/MarketBrowser";
import ItemRecipeBrowser from "../../components/ItemRecipeBrowser";

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
  | "inventory"
  | "recipeBrowser"
  | "marketBrowser";
interface IndexPageState {
  player: Player;
  openWindows: {
    [key in WindowTypes]: boolean;
  };
  selectedPlot?: Plot;
  RecipeItemID?: number;
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
        marketBrowser: false,
        recipeBrowser: false,
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
            <div className="browser-container">
              <StatList balance={this.state.player.balance} />{" "}
            </div>
            <div className="browser-container">
              <ItemBrowser
                isOpen={this.state.openWindows.itemBrowser}
                onFocus={() => {
                  this.state.windowStack.selectWindow("itemBrowser");
                  this.forceUpdate();
                }}
                className={this.state.windowStack.getClass("itemBrowser")}
              />{" "}
            </div>
            <div className="browser-container">
              <Inventory
                isOpen={this.state.openWindows.inventory}
                onFocus={() => {
                  this.state.windowStack.selectWindow("inventory");
                  this.forceUpdate();
                }}
                className={this.state.windowStack.getClass("inventory")}
              />
            </div>
            <div className="browser-container">
              <MarketBrowser
                isOpen={this.state.openWindows.marketBrowser}
                onFocus={() => {
                  this.state.windowStack.selectWindow("marketBrowser");
                  this.forceUpdate();
                }}
                onRecipeClick={(ItemID) => {
                  this.setState({
                    RecipeItemID: ItemID,
                    openWindows: {
                      ...this.state.openWindows,
                      recipeBrowser: true,
                    },
                  });
                }}
                className={this.state.windowStack.getClass("marketBrowser")}
              />
            </div>
            <div className="browser-container">
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
            </div>
            <div className="browser-container">
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
                onFocus={(p) => {
                  this.state.windowStack.selectWindow(p);
                  this.forceUpdate();
                }}
                className={this.state.windowStack.getClass("plotViewer")}
              />
            </div>
            <div className="browser-container">
              <ServerShop
                isOpen={this.state.openWindows.serverShop}
                onPurchase={() => emitCustomEvent("plotUpdate")}
              />
            </div>
            <div className="browser-container">
              <ItemRecipeBrowser
                isOpen={this.state.openWindows.recipeBrowser}
                onFocus={() => {
                  this.state.windowStack.selectWindow("recipeBrowser");
                  this.forceUpdate();
                }}
                recipeItemID={this.state.RecipeItemID}
                className={this.state.windowStack.getClass("recipeBrowser")}
              />{" "}
            </div>
          </div>
        </PlayerContext.Provider>
      </>
    );
  }
}
