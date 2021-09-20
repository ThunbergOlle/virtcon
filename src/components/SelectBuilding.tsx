import { useApolloClient } from "@apollo/client";
import { gql } from "graphql-tag";
import React, { useEffect, useState } from "react";
import { Button, Card, ListGroup, Table } from "react-bootstrap";
import Draggable from "react-draggable";
import {
  IntrBuilding,
  IntrItem,
  IntrPlayerInventory,
} from "../utils/interfaces";
import { Theme } from "../utils/Theme";
import WindowHeader from "./WindowHeader";
export default function SelectBuildingModal(props: {
  isOpen: boolean;
  onSelect: Function;
  inventory: IntrPlayerInventory;
}) {
  useEffect(() => {
    //Laddda de byggnader som finns i inventoriet.
  }, []);
  if (props.isOpen) {
    return (
      <Card>
        <p>Test</p>
      </Card>
    );
  } else return <></>;
}
