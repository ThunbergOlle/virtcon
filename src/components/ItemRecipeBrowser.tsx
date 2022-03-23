import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useEffect, useState } from "react";
import { Button, Card, ListGroup, Table } from "react-bootstrap";
import Draggable from "react-draggable";
import { WindowTypes } from "../pages/index/IndexPage";
import { Config } from "../utils/Config";
import { HideStyle } from "../utils/HideStyle";
import { Building, Item } from "../utils/interfaces";
import WindowHeader from "./WindowHeader";
import { Tree, TreeNode } from "react-organizational-chart";

export default function ItemRecipeBrowser(props: {
  isOpen: boolean;
  className: string;
  recipeItemID?: number;
  onClose: () => void;
  onFocus: (windowType: WindowTypes) => void;
}) {
  const [recipe, setRecipe] = useState<NodeType | undefined>(undefined);
  const client = useApolloClient();

  const fetchRecipe = async (recipeItemID: number) => {
    try {
      fetch(Config.baseUrl + "/recipe?ItemID=" + recipeItemID)
        .then((response) => response.json())
        .then((data) => {
          setRecipe(data);
        });
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    if (props.recipeItemID) {
      fetchRecipe(props.recipeItemID);
    }
  }, [props.recipeItemID]);

  return (
    <Draggable
      axis="both"
      handle=".handle"
      bounds={{ top: 0 }}
      defaultPosition={{ x: 40, y: 10 }}
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("recipeBrowser")}
    >
      <Card style={{ width: 1000, ...HideStyle(!props.isOpen) }}>
        <WindowHeader title="Recipe Browser" onClose={() => props.onClose()} />
        <div
          style={{
            overflowY: "scroll",
            display: "flex",
            flexDirection: "column",
            height: 400,
          }}
        >
          {recipe && (
            <Tree
              lineWidth={"2px"}
              lineColor={"green"}
              lineBorderRadius={"10px"}
              label={recipe.item.name}
            >
              <Node item={recipe} amount={1} />
            </Tree>
          )}
        </div>
      </Card>
    </Draggable>
  );
}
interface NodeType {
  item: Item;

  madeIn: Building;

  madeFrom: { item: NodeType; amount: number }[];

  msrp: number;

  amount: number;
}
function Node(props: { item: NodeType; amount: number }) {
  return (
    <TreeNode
      label={
        <div>
          <em style={{ color: "GrayText" }}>{props.item.madeIn?.name}</em>
          <p style={{ paddingBottom: 0, marginBottom: 0 }}>
            {props.amount.toFixed(2) +
              "x " +
              (props.item.item.name || "") +
              " "}
            <em
              style={{ color: "GrayText", fontSize: 12, margin: 0, padding: 0 }}
            >
              (${props.item.msrp || "?"})
            </em>
          </p>
        </div>
      }
    >
      {props.item.madeFrom?.map((i) => (
        <Node item={i.item} amount={i.amount} />
      ))}
    </TreeNode>
  );
}
