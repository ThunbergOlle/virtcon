import React from "react";
import { Button, Container, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { WindowTypes } from "../pages/index/IndexPage";

export default function ActionBar(props: {
  onWindowOpened: (types: WindowTypes) => void;
}) {
  return (
    <Navbar style={{ backgroundColor: "darkgray" }} variant="dark">
      <Container style={{ height: 25 }}>
        <Button size="sm" onClick={() => props.onWindowOpened("plotBrowser")}>
          My plots
        </Button>
        <Button size="sm" onClick={() => props.onWindowOpened("itemBrowser")}>
          Item Browser
        </Button>
        <Button
          size="sm"
          onClick={() => props.onWindowOpened("buildingCrafter")}
        >
          Building Crafter
        </Button>
        <Button size="sm" onClick={() => props.onWindowOpened("marketBrowser")}>
          Marketplace
        </Button>
        <Button
          size="sm"
          onClick={() => props.onWindowOpened("productionOverview")}
        >
          Production Overview
        </Button>
        <Button size="sm" onClick={() => props.onWindowOpened("serverShop")}>
          Server shop
        </Button>
        <Button size="sm" onClick={() => props.onWindowOpened("inventory")}>
          Inventory
        </Button>
        <Button
          size="sm"
          onClick={() => props.onWindowOpened("playerScoreboard")}
        >
          Scoreboard
        </Button>
      </Container>
    </Navbar>
  );
}
