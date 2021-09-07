import React from "react";
import { Button, Container, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function ActionBar(props: { onWindowOpened: Function }) {
  return (
    <Navbar bg="secondary" variant="dark">
      <Container style={{ height: 25 }}>
        <Button size="sm" onClick={() => props.onWindowOpened("plotBrowser")}>
          My plots
        </Button>
        <Button size="sm" onClick={() => props.onWindowOpened("itemBrowser")}>
          Item Browser
        </Button>
        <Button size="sm" onClick={() => props.onWindowOpened("serverShop")}>
          Server shop
        </Button>
      </Container>
    </Navbar>
  );
}
