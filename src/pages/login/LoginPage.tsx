import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./LoginStyle.css";
import { Config } from "../../utils/Config";
import gql from "graphql-tag";
import { useApolloClient } from "@apollo/client";
import { toast } from "react-toastify";
type Mode = "login" | "signup";
export default function Login(props: { onLogin: Function }) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorText, setErrorText] = useState("");
  const client = useApolloClient();

  function validateForm() {
    return email.length > 0 && password.length > 0;
  }
  const onSignupPressed = async () => {
    try {
      if (confirmPassword !== password) {
        setErrorText("Passwords are not matching");
        return;
      }
      const mutation = gql`
        mutation main($options: PlayerNewInput!) {
          PlayerNew(options: $options) {
            balance
          }
        }
      `;
      let data = await client.mutate({
        mutation: mutation,
        variables: {
          options: {
            email: email,
            password: password,
            display_name: displayName,
          },
        },
      });
      if (data.data.PlayerNew) {
        setMode("login");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setDisplayName("");
        toast.success("Successfully created account!", { autoClose: 5000 });
      } else if (data.errors) {
        throw data.errors;
      }
    } catch (e) {
      console.log(e);
      setErrorText(String(e));
    }
  };
  const onLoginPressed = async () => {
    // Skicka http request;
    try {
      const loginQuery = gql`
        mutation main($email: String!, $password: String!) {
          PlayerLogin(options: { email: $email, password: $password }) {
            token
          }
        }
      `;
      let data = await client.query({
        query: loginQuery,
        variables: { email: email, password: password },
      });
      console.dir(data);
      if (data.data.PlayerLogin) {
        sessionStorage.setItem("token", data.data.PlayerLogin.token);
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
        <h1>{mode === "login" ? "Login" : "Create account"}</h1>
        <Button
          size="sm"
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
        >
          {mode === "login"
            ? "Create account instead"
            : "I already have an account"}
        </Button>
        <p style={{ color: "red" }}>{errorText}</p>
        {mode === "signup" ? (
          <Form.Group controlId="displayname">
            <Form.Label>Display name</Form.Label>
            <Form.Control
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </Form.Group>
        ) : null}
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
        {mode === "signup" ? (
          <Form.Group controlId="password-confirm">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>
        ) : null}
        <Button
          size="lg"
          disabled={!validateForm()}
          onClick={() => {
            mode === "signup" ? onSignupPressed() : onLoginPressed();
          }}
        >
          Submit
        </Button>
      </Form>
    </div>
  );
}
