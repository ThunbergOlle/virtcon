import React, { useEffect } from "react";
import { Container, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function TopBar(props: { display_name: string }) {
  return (
    <Navbar bg="primary" variant="dark">
      <Container color="">
        <Navbar.Brand href="#home">Virtcon</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            Logged in as: <Link to="/profile">{props.display_name}</Link>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
