import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Form, ListGroup, Table } from "react-bootstrap";
import { useCustomEventListener } from "react-custom-events";
import Draggable from "react-draggable";
import { PlayerContext } from "../context/PlayerContext";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import { InventoryItem, Item } from "../utils/interfaces";
import { MoneyFormatter } from "../utils/MoneyFormatter";
import WindowHeader from "./WindowHeader";
export default function Inventory(props: {
  isOpen: boolean;
  onFocus: (windowType: WindowTypes) => void;
  onClose: () => void;
  onItemClick: (itemId: number) => void;
  className: string;
  playerId?: number;
}) {
  const [hideContent, setHideContent] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const getPlayer = useContext(PlayerContext);
  const [currentPlayerName, setCurrentPlayerName] = useState<string>(
    getPlayer ? getPlayer.display_name! : ""
  );
  const [currentPlayerId, setCurrentPlayerId] = useState<number>(
    getPlayer ? getPlayer.id! : 0
  );
  const client = useApolloClient();

  const fetchInventoryData = async (playerId: number) => {
    const query = gql`
      query fetchInventoryData($playerId: Int, $relations: [String!]) {
        Players(filter: { id: $playerId }, relations: $relations) {
          display_name
          id
          inventory {
            id
            item {
              id
              name
              rarity
              type
              market_name
              price
            }
            amount
            building {
              name
              id
            }
          }
        }
      }
    `;

    let data = await client.query({
      query: query,
      variables: {
        playerId: playerId,
        relations: ["inventory", "inventory.item", "inventory.building"],
      },
    });
    console.dir(data);
    setInventory(data.data.Players[0].inventory);
    setCurrentPlayerId(data.data.Players[0].id);
    setCurrentPlayerName(data.data.Players[0].display_name);
  };
  useCustomEventListener("inventoryUpdate", async (data) => {
    // När inventoryt har uppdaterats så ska vi hämta datan igen
    if (currentPlayerId === getPlayer.id) {
      fetchInventoryData(getPlayer.id);
    }
  });
  useEffect(() => {
    console.log(getPlayer.id);
    if (getPlayer.id) {
      fetchInventoryData(getPlayer.id);
    }
  }, []);
  useEffect(() => {
    if (props.playerId !== undefined) {
      fetchInventoryData(props.playerId);
    }
  }, [props.playerId]);
  return (
    <Draggable
      axis="both"
      handle=".handle"
      defaultPosition={{ x: 40, y: 10 }}
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("inventory")}
    >
      <Card style={{ width: 800, ...HideStyle(!props.isOpen) }}>
        <WindowHeader
          title={"Inventory of " + currentPlayerName}
          onClose={() => props.onClose()}
        />
        {getPlayer.id && currentPlayerId !== getPlayer.id ? (
          <Button
            size="sm"
            onClick={() => {
              fetchInventoryData(getPlayer!.id!);
            }}
            style={{ backgroundColor: "orange", borderColor: "orange" }}
          >
            View my inventory instead
          </Button>
        ) : null}
        <Form.Group style={{ marginLeft: 10 }}>
          <Form.Label>Item name</Form.Label>
          <Form.Control
            size="sm"
            type="text"
            onChange={(e) => setNameFilter(e.target.value.toUpperCase())}
          ></Form.Control>
          <Form.Text className="text-muted">
            Search for the item you want to checkout
          </Form.Text>
        </Form.Group>
        <Table hover striped style={HideStyle(hideContent)}>
          <thead>
            <th>Icon</th>
            <th>Name</th>
            <th>Type</th>
            <th>Rarity</th>
            <th style={{ textAlign: "right" }}>Amount</th>
            <th style={{ textAlign: "right" }}>Value</th>
            <th>Action</th>
          </thead>
          <tbody>
            {inventory?.map((i) => {
              //Avgör om det är en byggnad eller en sak.

              if (
                i.building &&
                i.building.name.toUpperCase().includes(nameFilter)
              ) {
                return (
                  <tr id={String(i.id)} key={i.id}>
                    <td>
                      <img src={`./icons/${"factory"}.png`} height="25" />
                    </td>
                    <td>{i.building.name}</td>
                    <td>Building</td>
                    <td>-</td>
                    <td style={{ textAlign: "right" }}>{i.amount}</td>
                    <td style={{ textAlign: "right" }}>-</td>
                    <td></td>
                  </tr>
                );
              } else if (
                i.item !== null &&
                i.item.name.toUpperCase().includes(nameFilter)
              ) {
                return (
                  <tr id={String(i.id)} key={i.id}>
                    <td>
                      <img
                        src={`./icons/${i.item.market_name}.png`}
                        height="25"
                      />
                    </td>
                    <td>{i.item.name}</td>
                    <td>{i.item.type}</td>
                    <td>{i.item.rarity}</td>
                    <td style={{ textAlign: "right" }}>{i.amount}</td>
                    <td style={{ textAlign: "right" }}>
                      {MoneyFormatter.format(i.item.price * i.amount)}
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
                        onClick={() => props.onItemClick(i.item.id)}
                        disabled={i.item.type === "currency"}
                      >
                        Trade
                      </Button>
                    </td>
                  </tr>
                );
              } else return null;
            })}
          </tbody>
        </Table>
      </Card>
    </Draggable>
  );
}
