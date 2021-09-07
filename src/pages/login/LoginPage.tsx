import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./LoginStyle.css";
import { Config } from "../../utils/Config";
import gql from "graphql-tag";
import { useApolloClient } from "@apollo/client";

export default function Login(props: { onLogin: Function }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const client = useApolloClient();

  function validateForm() {
    return email.length > 0 && password.length > 0;
  }
  const onLoginPressed = async () => {
    // Skicka http request;
    try {
      const loginQuery = gql`
        query main($email: String!, $password: String!) {
          Login(email: $email, password: $password)
        }
      `;
      let data = await client.query({
        query: loginQuery,
        variables: { email: email, password: password },
      });
      console.dir(data);
      if (data.data.Login) {
        sessionStorage.setItem("token", data.data.Login);
        props.onLogin();
      } else {
        throw data.error;
      }
    } catch (e) {
      console.log(e);
      setErrorText(String(e));
    }
  };

  return (
    <div className="Login">
      <Form>
        <h1>Logga in - Virtcon</h1>
        <p style={{ color: "red" }}>{errorText}</p>
        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button
          size="lg"
          disabled={!validateForm()}
          onClick={() => onLoginPressed()}
        >
          Login
        </Button>
        <Button size="lg" disabled={true}>
          Sign up
        </Button>
      </Form>
    </div>
  );
}
