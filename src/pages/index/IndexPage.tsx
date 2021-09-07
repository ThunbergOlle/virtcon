import {
  ApolloClient,
  NormalizedCache,
  NormalizedCacheObject,
} from "@apollo/client";
import React from "react";
import Draggable from "react-draggable";
import { toast } from "react-toastify";
import ActionBar from "../../components/ActionBar";
import ItemBrowser from "../../components/ItemBrowser";
import ServerShop from "../../components/ServerShop";
import StatList from "../../components/StatList";
import { ValidateSession } from "../../functions/ValidateSession";
import { IntrPlayer } from "../../utils/interfaces";

interface IndexPageProps {
  player: IntrPlayer;
  client: ApolloClient<NormalizedCacheObject>;
}
export type WindowTypes = "itemBrowser" | "serverShop" | "plotBrowser";
interface IndexPageState {
  player: IntrPlayer;
  openWindows: {
    [key in WindowTypes]: boolean;
  };
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
      },
    };
  }
  updatePlayer() {
    ValidateSession(this.props.client)
      .then((player: IntrPlayer) => {
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
        <ActionBar
          onWindowOpened={(window: WindowTypes) => {
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
          <ServerShop
            isOpen={this.state.openWindows.serverShop}
            onPurchase={() => this.updatePlayer()}
          />
        </div>
      </>
    );
  }
}
