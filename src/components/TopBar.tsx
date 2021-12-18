import React, { useEffect } from "react";
import { Button, Container, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function TopBar(props: { display_name: string }) {
  return (
    <Navbar bg="primary" variant="dark">
      <Container>
        <img src={"./icons/virtcon_logo.png"} height={40} />

        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text style={{ marginRight: 10 }}>
            <a
              href="https://discord.gg/sfsBuPNEeZ"
              target="_blank"
              style={{ textDecoration: "underline" }}
            >
              Join our discord!
            </a>
          </Navbar.Text>
          <Navbar.Text>
            Logged in as: <Link to="/profile">{props.display_name}</Link>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
