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
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
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
      if (data.data && data.data.PlayerNew) {
        toast.success("Email confirmation sent!", { autoClose: 5000 });
        setAwaitingCode(true);
      } else if (data.errors) {
        console.log(data.errors);
        throw data.errors;
      } else throw "Someone has already signed up with this email.";
    } catch (e) {
      console.log(e);
      setErrorText(String(e));
    }
  };
  const checkConfirmationCode = async () => {
    try {
      const mutation = gql`
        mutation main($email: String!, $code: String!) {
          PlayerConfirmCode(email: $email, code: $code)
        }
      `;
      let data = await client.mutate({
        mutation: mutation,
        variables: { email: email, code: confirmationCode },
      });
      console.dir(data);
      if (data.data.PlayerConfirmCode) {
        setMode("login");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setDisplayName("");
        toast.success("Successfully created account!", { autoClose: 5000 });
        setAwaitingCode(false);
      } else {
        throw "Felaktig kod.";
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
            success
            message
          }
        }
      `;
      let data = await client.query({
        query: loginQuery,
        variables: { email: email, password: password },
      });
      console.dir(data);
      if (data.data.PlayerLogin) {
        if (data.data.PlayerLogin.success) {
          console.log("SUCCESS");
          sessionStorage.setItem("token", data.data.PlayerLogin.token);
          props.onLogin();
        } else {
          throw data.data.PlayerLogin.message;
        }
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
        {awaitingCode ? (
          <>
            <Form.Group controlId="email">
              <Form.Label>Confirmation Code</Form.Label>
              <Form.Control
                autoFocus
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
              />
            </Form.Group>
            <p style={{ color: "red" }}>{errorText}</p>

            <Button
              size="lg"
              onClick={() => {
                checkConfirmationCode();
                setErrorText("");
              }}
            >
              Submit
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              onClick={() => {
                setMode(mode === "signup" ? "login" : "signup");
                setErrorText("");
              }}
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
                setErrorText("");
              }}
            >
              Submit
            </Button>
          </>
        )}
      </Form>
    </div>
  );
}
