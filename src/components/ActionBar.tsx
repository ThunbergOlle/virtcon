import { useContext } from "react";
import {
  Button,
  Container,
  Dropdown,
  DropdownButton,
  Navbar,
} from "react-bootstrap";
import { PlayerContext } from "../context/PlayerContext";
import { WindowTypes } from "../pages/index/IndexPage";

export default function ActionBar(props: {
  onWindowOpened: (types: WindowTypes, id?: number) => void;
}) {
  const getPlayer = useContext(PlayerContext);
  return (
    <Navbar style={{ backgroundColor: "darkgray" }} variant="dark">
      <Container style={{ height: 25 }}>
        <DropdownButton title="Economy" id="bg-vertical-dropdown-1" size="sm">
          <Dropdown.Item
            eventKey="1"
            onClick={() => props.onWindowOpened("marketBrowser")}
          >
            Resource Marketplace
          </Dropdown.Item>
          <Dropdown.Item
            eventKey="2"
            onClick={() => props.onWindowOpened("serverShop")}
          >
            Server Shop
          </Dropdown.Item>

          <Dropdown.Item
            eventKey="3"
            onClick={() => props.onWindowOpened("playerScoreboard")}
          >
            Scoreboard
          </Dropdown.Item>
          <Dropdown.Item
            eventKey="4"
            disabled
            onClick={() => props.onWindowOpened("plotMarketBrowser")}
          >
            Plot Market
          </Dropdown.Item>
          <Dropdown.Item
            disabled
            eventKey="5"
            onClick={() => props.onWindowOpened("blackMarket")}
          >
            Black Market
          </Dropdown.Item>
        </DropdownButton>
        <DropdownButton
          title="Production"
          id="bg-vertical-dropdown-1"
          size="sm"
        >
          <Dropdown.Item
            eventKey="1"
            onClick={() =>
              props.onWindowOpened("productionOverview", getPlayer.id)
            }
          >
            Production Overview
          </Dropdown.Item>
          <Dropdown.Item
            eventKey="2"
            onClick={() => props.onWindowOpened("buildingCrafter")}
          >
            Building Crafter
          </Dropdown.Item>
          <Dropdown.Item
            eventKey="3"
            onClick={() => props.onWindowOpened("itemBrowser")}
          >
            Item Browser
          </Dropdown.Item>
        </DropdownButton>
        <DropdownButton title="Me" id="bg-vertical-dropdown-1" size="sm">
          <Dropdown.Item
            eventKey="1"
            onClick={() => props.onWindowOpened("plotBrowser")}
          >
            My Plots
          </Dropdown.Item>
          <Dropdown.Item
            eventKey="2"
            onClick={() => props.onWindowOpened("inventory", getPlayer.id)}
          >
            Inventory
          </Dropdown.Item>
          <Dropdown.Item
            eventKey="3"
            onClick={() => props.onWindowOpened("myMarketListings")}
          >
            Current listings
          </Dropdown.Item>
        </DropdownButton>
        <Button size="sm" onClick={() => props.onWindowOpened("chat")}>
          Chat
        </Button>
      </Container>
    </Navbar>
  );
}
