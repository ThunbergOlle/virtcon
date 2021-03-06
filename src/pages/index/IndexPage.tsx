import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import React from "react";
import { toast } from "react-toastify";
import ActionBar from "../../components/ActionBar";
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
import BlackMarket from "../../components/BlackMarket";
import ProfileViewer from "../../components/ProfileViewer/ProfileViewer";
import PlotMarketBrowser from "../../components/PlotMarketBrowser";
import Chat from "../../components/Chat";
import PlotOverviewBackground from "../../components/PlotOverviewBackground";
import ChartViewer from "../../components/ChartViewer";
import BuildingOverview from "../../components/BuildingOverview/BuildingOverview";
import PlayerTransactionLog from "../../components/PlayerTransactionLog/PlayerTransactionLog";

interface IndexPageProps {
  player: Player;
  client: ApolloClient<NormalizedCacheObject>;
}
export type WindowTypes =
  | "itemBrowser"
  | "serverShop"
  | "plotBrowser"
  | "plotViewer"
  | "plotMarketBrowser"
  | "buildingBrowser"
  | "inventory"
  | "recipeBrowser"
  | "productionOverview"
  | "marketBrowser"
  | "playerScoreboard"
  | "buildingCrafter"
  | "myMarketListings"
  | "blackMarket"
  | "chat"
  | "profileViewer"
  | "statList"
  | "buildingOverview"
  | "playerTransactionLog"
  | "chartViewer";
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
  viewPlayer: number | undefined;
  viewPlayerOverviewId: number | undefined;
  viewPlayerChartId: number | undefined;
  browsePlayerPlots: number | undefined;
  viewPlayerBuildingOverviewId: number | undefined;
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
        profileViewer: false,
        serverShop: false,
        blackMarket: false,
        playerScoreboard: false,
        productionOverview: false,
        plotBrowser: false,
        myMarketListings: false,
        plotMarketBrowser: false,
        buildingBrowser: false,
        chat: false,
        inventory: false,
        chartViewer: false,
        buildingOverview: false,
        plotViewer: false,
        marketBrowser: false,
        recipeBrowser: false,
        buildingCrafter: false,
        playerTransactionLog: false,
        statList: false,
      },
      windowStack: new WindowStack(),
      selectedPlot: undefined,
      selectedMarketItem: undefined,
      viewPlayerInventoryId: undefined,
      viewPlayerChartId: undefined,
      viewPlayerOverviewId: undefined,
      viewPlayerBuildingOverviewId: undefined,
      viewPlayer: undefined,
      browsePlayerPlots: undefined,
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
  selectWindow(window: WindowTypes, alwaysFocus?: boolean) {
    this.setState({
      openWindows: {
        ...this.state.openWindows,
        [window]: alwaysFocus || !this.state.openWindows[window],
      },
    });
    this.state.windowStack.selectWindow(window);
  }
  onWindowOpenedFromMenu(window: WindowTypes, targetId?: number) {
    if (targetId) {
      if (window === "inventory") {
        this.setState({
          viewPlayerInventoryId: targetId,
        });
      } else if (window === "productionOverview") {
        this.setState({
          viewPlayerOverviewId: targetId,
        });
      } else if (window === "buildingOverview") {
        this.setState({
          viewPlayerBuildingOverviewId: targetId,
        });
      }
    }

    this.selectWindow(window);
  }
  render() {
    return (
      <>
        <PlayerContext.Provider value={this.state.player}>
          <ActionBar
            onWindowOpened={(window, targetId) =>
              this.onWindowOpenedFromMenu(window, targetId)
            }
          />
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
                playerId={this.state.browsePlayerPlots}
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
                onPlotClicked={(p: Plot) => {
                  this.setState({
                    selectedPlot: p,
                  });
                  this.selectWindow("plotViewer", true);
                }}
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
                onFocus={(p) => {
                  this.state.windowStack.selectWindow(p);
                  this.forceUpdate();
                }}
                onClose={() => this.closeWindow("serverShop")}
                className={this.state.windowStack.getClass("serverShop")}
              />
            </div>
            <div className="browser-container">
              <PlotMarketBrowser
                isOpen={this.state.openWindows.plotMarketBrowser}
                onPlotClicked={(plot) => {
                  this.setState({
                    selectedPlot: plot,
                  });
                  this.selectWindow("plotViewer", true);
                }}
                onFocus={(p) => {
                  this.state.windowStack.selectWindow(p);
                  this.forceUpdate();
                }}
                onClose={() => this.closeWindow("plotMarketBrowser")}
                className={this.state.windowStack.getClass("plotMarketBrowser")}
              />
            </div>
            <div className="browser-container">
              <BlackMarket
                isOpen={this.state.openWindows.blackMarket}
                onFocus={(p) => {
                  this.state.windowStack.selectWindow(p);
                  this.forceUpdate();
                }}
                onClose={() => this.closeWindow("blackMarket")}
                className={this.state.windowStack.getClass("blackMarket")}
              />
            </div>
            <div className="browser-container">
              <ProfileViewer
                isOpen={this.state.openWindows.profileViewer}
                onFocus={(p) => {
                  this.state.windowStack.selectWindow(p);
                  this.forceUpdate();
                }}
                playerId={this.state.viewPlayer}
                onClose={() => this.closeWindow("profileViewer")}
                className={this.state.windowStack.getClass("profileViewer")}
                onBrowsePlayerPlots={(playerId) => {
                  this.state.windowStack.selectWindow("plotBrowser");
                  this.setState({
                    browsePlayerPlots: playerId,
                    openWindows: {
                      ...this.state.openWindows,
                      plotBrowser: true,
                    },
                  });
                }}
                onViewPlayerChart={(playerId) => {
                  this.state.windowStack.selectWindow("chartViewer");
                  this.setState({
                    viewPlayerChartId: playerId,
                    openWindows: {
                      ...this.state.openWindows,
                      chartViewer: true,
                    },
                  });
                }}
                onViewPlayerBuilding={(playerId) => {
                  this.state.windowStack.selectWindow("buildingOverview");
                  this.setState({
                    viewPlayerBuildingOverviewId: playerId,
                    openWindows: {
                      ...this.state.openWindows,
                      buildingOverview: true,
                    },
                  });
                }}
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
                onPlayerClicked={(playerId: number) => {
                  this.state.windowStack.selectWindow("profileViewer");
                  this.setState({
                    viewPlayer: playerId,
                    openWindows: {
                      ...this.state.openWindows,
                      profileViewer: true,
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
            <div className="browser-container">
              <Chat
                isOpen={this.state.openWindows.chat}
                onClose={() => this.closeWindow("chat")}
                onFocus={() => {
                  this.state.windowStack.selectWindow("chat");
                  this.forceUpdate();
                }}
                className={this.state.windowStack.getClass("chat")}
              />{" "}
            </div>

            <div className="browser-container">
              <BuildingOverview
                isOpen={this.state.openWindows.buildingOverview}
                onClose={() => this.closeWindow("buildingOverview")}
                onFocus={() => {
                  this.state.windowStack.selectWindow("buildingOverview");
                  this.forceUpdate();
                }}
                playerId={this.state.viewPlayerBuildingOverviewId}
                className={this.state.windowStack.getClass("buildingOverview")}
              />{" "}
            </div>
            <div className="browser-container">
              <PlayerTransactionLog
                isOpen={this.state.openWindows.playerTransactionLog}
                onClose={() => this.closeWindow("playerTransactionLog")}
                onFocus={() => {
                  this.state.windowStack.selectWindow("playerTransactionLog");
                  this.forceUpdate();
                }}
                className={this.state.windowStack.getClass(
                  "playerTransactionLog"
                )}
              />{" "}
            </div>
            <PlotOverviewBackground
              onSelectedPlot={(plotId) => {
                this.setState({
                  selectedPlot: { id: plotId } as Plot,
                });
                this.selectWindow("plotViewer", true);
              }}
            />
          </div>
        </PlayerContext.Provider>
      </>
    );
  }
}
