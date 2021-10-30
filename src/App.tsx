import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from "@apollo/client";
import "./App.css";
import LoginPage from "./pages/login/LoginPage";
import { Player } from "./utils/interfaces";
import "bootstrap/dist/css/bootstrap.min.css";
import { ValidateSession } from "./functions/ValidateSession";
import IndexPage from "./pages/index/IndexPage";
import { setContext } from "@apollo/client/link/context";
import { Config } from "./utils/Config";
import TopBar from "./components/TopBar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const httpLink = new HttpLink({ uri: Config.baseUrl + "/graphql" });
const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = sessionStorage.getItem("token");

  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token || "",
    },
  };
});

// Initialize Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    mutate: { errorPolicy: "ignore" },
    query: { fetchPolicy: "no-cache" },
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [player, setPlayer] = useState<Player>();
  const CheckLoggedIn = () => {
    /* Hitta om det finns en kaka som sparar session */
    let data = sessionStorage.getItem("token");

    if (data) {
      ValidateSession(client)
        .then((player: Player) => {
          console.log(player);
          if (player.email) {
            setPlayer(player);
            setIsLoggedIn(true);
          } else {
            setPlayer(undefined);
            setIsLoggedIn(false);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };
  useEffect(() => {
    CheckLoggedIn();
  }, []);
  return (
    <ApolloProvider client={client}>
      <Router>
        <div>
          {isLoggedIn && player ? (
            <>
              <TopBar display_name={player?.display_name} />
              <Switch>
                <Route path="/about">
                  <p>About</p>
                </Route>

                <Route path="/">
                  <IndexPage client={client} player={player} />
                </Route>
              </Switch>
            </>
          ) : (
            <LoginPage onLogin={() => CheckLoggedIn()} />
          )}
        </div>
      </Router>
      <ToastContainer autoClose={5000} hideProgressBar={false} />
    </ApolloProvider>
  );
}

export default App;
