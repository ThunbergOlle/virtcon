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
import BuildingCrafter from "../../components/BuildingCrafter";
import ProductionOverview from "../../components/ProductionOverview";
import PlayerScoreboard from "../../components/PlayerScoreboard";
import MyMarketListings from "../../components/MyMarketListings";

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
  | "productionOverview"
  | "marketBrowser"
  | "playerScoreboard"
  | "buildingCrafter"
  | "myMarketListings"
  | "statList";
interface IndexPageState {
  player: Player;
  openWindows: {
    [key in WindowTypes]: boolean;
  };
  selectedPlot?: Plot;
  selectedMarketItem?: number;
  RecipeItemID?: number;
  windowStack: WindowStack;
  viewPlayerInventoryId: number | undefined;
  viewPlayerOverviewId: number | undefined;
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
        playerScoreboard: false,
        productionOverview: false,
        plotBrowser: false,
        myMarketListings: false,
        buildingBrowser: false,
        inventory: false,
        plotViewer: false,
        marketBrowser: false,
        recipeBrowser: false,
        buildingCrafter: false,
        statList: false,
      },
      windowStack: new WindowStack(),
      selectedPlot: undefined,
      selectedMarketItem: undefined,
      viewPlayerInventoryId: undefined,
      viewPlayerOverviewId: undefined,
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

  closeWindow(window: WindowTypes) {
    this.setState({
      openWindows: {
        ...this.state.openWindows,
        [window]: false,
      },
    });
  }
  onRecipeClicked(ItemID: number) {
    this.setState({
      RecipeItemID: ItemID,
      openWindows: {
        ...this.state.openWindows,
        recipeBrowser: true,
      },
    });
    this.state.windowStack.selectWindow("recipeBrowser");
  }
  onMarketClicked(ItemID: number) {
    this.setState({
      openWindows: {
        ...this.state.openWindows,
        marketBrowser: true,
      },
      selectedMarketItem: ItemID,
    });
    this.state.windowStack.selectWindow("marketBrowser");
  }
  selectWindow(window: WindowTypes) {
    this.setState({
      openWindows: {
        ...this.state.openWindows,
        [window]: !this.state.openWindows[window],
      },
    });
    this.state.windowStack.selectWindow(window);
  }
  render() {
    return (
      <>
        <PlayerContext.Provider value={this.state.player}>
          <ActionBar onWindowOpened={(window) => this.selectWindow(window)} />
          <div
            style={{
              position: "relative",
              width: window.innerWidth - 10,
              height: window.innerHeight,
              backgroundImage: this.state.player.backgroundURL
                ? `url("${this.state.player.backgroundURL}")`
                : undefined,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="browser-container">
              <StatList
                isOpen={this.state.openWindows.statList}
                onClose={() => this.closeWindow("statList")}
                onFocus={(window) => this.selectWindow(window)}
                onUpdate={() => this.updatePlayer()}
                className={this.state.windowStack.getClass("statList")}
              />{" "}
            </div>
            <div className="browser-container">
              <ItemBrowser
                isOpen={this.state.openWindows.itemBrowser}
                onFocus={() => {
                  this.state.windowStack.selectWindow("itemBrowser");
                  this.forceUpdate();
                }}
                onViewMarketClicked={(ItemId) => this.onMarketClicked(ItemId)}
                onRecipeClicked={(ItemId) => this.onRecipeClicked(ItemId)}
                onClose={() => this.closeWindow("itemBrowser")}
                className={this.state.windowStack.getClass("itemBrowser")}
              />{" "}
            </div>
            <div className="browser-container">
              <Inventory
                isOpen={this.state.openWindows.inventory}
                playerId={this.state.viewPlayerInventoryId}
                onFocus={() => {
                  this.state.windowStack.selectWindow("inventory");
                  this.forceUpdate();
                }}
                onMarketOffersClick={() =>
                  this.selectWindow("myMarketListings")
                }
                onClose={() => this.closeWindow("inventory")}
                onItemClick={(itemId) => this.onMarketClicked(itemId)}
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
                onClose={() => this.closeWindow("marketBrowser")}
                onRecipeClick={(ItemID) => this.onRecipeClicked(ItemID)}
                selectedMarketItem={this.state.selectedMarketItem}
                className={this.state.windowStack.getClass("marketBrowser")}
              />
            </div>
            <div className="browser-container">
              <PlotBrowser
                onFocus={() => {
                  this.state.windowStack.selectWindow("plotBrowser");
                  this.forceUpdate();
                }}
                onClose={() =>
                  this.setState({
                    openWindows: {
                      ...this.state.openWindows,
                      plotBrowser: false,
                    },
                  })
                }
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
                onFocus={(p) => {
                  this.state.windowStack.selectWindow(p);
                  this.forceUpdate();
                }}
                onClose={() => this.closeWindow("serverShop")}
                className={this.state.windowStack.getClass("serverShop")}
              />
            </div>
            <div className="browser-container">
              <ItemRecipeBrowser
                onClose={() => this.closeWindow("recipeBrowser")}
                isOpen={this.state.openWindows.recipeBrowser}
                onFocus={() => {
                  this.state.windowStack.selectWindow("recipeBrowser");
                  this.forceUpdate();
                }}
                recipeItemID={this.state.RecipeItemID}
                className={this.state.windowStack.getClass("recipeBrowser")}
              />{" "}
            </div>
            <div className="browser-container">
              <BuildingCrafter
                isOpen={this.state.openWindows.buildingCrafter}
                onClose={() => this.closeWindow("buildingCrafter")}
                onFocus={() => {
                  this.state.windowStack.selectWindow("buildingCrafter");
                  this.forceUpdate();
                }}
                className={this.state.windowStack.getClass("buildingCrafter")}
              />{" "}
            </div>
            <div className="browser-container">
              <ProductionOverview
                isOpen={this.state.openWindows.productionOverview}
                onClose={() => this.closeWindow("productionOverview")}
                playerId={this.state.viewPlayerOverviewId}
                onFocus={() => {
                  this.state.windowStack.selectWindow("productionOverview");
                  this.forceUpdate();
                }}
                className={this.state.windowStack.getClass(
                  "productionOverview"
                )}
              />{" "}
            </div>
            <div className="browser-container">
              <PlayerScoreboard
                isOpen={this.state.openWindows.playerScoreboard}
                onClose={() =>
                  this.setState({
                    openWindows: {
                      ...this.state.openWindows,
                      playerScoreboard: false,
                    },
                  })
                }
                onViewPlayerInventory={(playerId) => {
                  this.state.windowStack.selectWindow("inventory");
                  this.setState({
                    viewPlayerInventoryId: playerId,
                    openWindows: {
                      ...this.state.openWindows,
                      inventory: true,
                    },
                  });
                }}
                onViewPlayerOverview={(playerId) => {
                  this.state.windowStack.selectWindow("productionOverview");
                  this.setState({
                    viewPlayerOverviewId: playerId,
                    openWindows: {
                      ...this.state.openWindows,
                      productionOverview: true,
                    },
                  });
                }}
                onFocus={() => {
                  this.state.windowStack.selectWindow("playerScoreboard");
                  this.forceUpdate();
                }}
                className={this.state.windowStack.getClass("playerScoreboard")}
              />{" "}
            </div>
            <div className="browser-container">
              <MyMarketListings
                isOpen={this.state.openWindows.myMarketListings}
                onClose={() => this.closeWindow("myMarketListings")}
                onFocus={() => {
                  this.state.windowStack.selectWindow("myMarketListings");
                  this.forceUpdate();
                }}
                className={this.state.windowStack.getClass("myMarketListings")}
              />{" "}
            </div>
          </div>
        </PlayerContext.Provider>
      </>
    );
  }
}
