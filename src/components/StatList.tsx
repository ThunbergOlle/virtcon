import {
  ApolloClient,
  gql,
  NormalizedCacheObject,
  useApolloClient,
} from "@apollo/client";
import React, { useEffect, useState } from "react";
import { Button, Card, ListGroup, Table } from "react-bootstrap";
import { useCustomEventListener } from "react-custom-events";
import Draggable from "react-draggable";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import { Player } from "../utils/interfaces";
import WindowHeader from "./WindowHeader";
export default function StatList(props: {
  onClose: () => void;
  onFocus: (window: WindowTypes) => void;
  onUpdate: () => void;
  isOpen: boolean;
  className: string;
}) {
  const [hideContent, setHideContent] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backgroundURL, setBackgroundURL] = useState<string>("");
  const [user, setUser] = useState<Player>();
  const client = useApolloClient();
  const saveUserData = async () => {
    setLoading(true);
    const mutation = gql`
      mutation main($url: String!) {
        PlayerUpdateBackground(url: $url) {
          success
        }
      }
    `;
    let data = await client.mutate({
      mutation: mutation,
      variables: { url: backgroundURL },
    });
    setLoading(false);
    setIsEditable(false);
    props.onUpdate();
  };
  const UpdateStats = async () => {
    setLoading(true);
    const query = gql`
      query {
        PlayerLoggedIn {
          id
          email
          display_name
          balance
          backgroundURL
        }
      }
    `;
    let data = await client.query({
      query: query,
    });
    setUser(data.data.PlayerLoggedIn);
    setBackgroundURL(data.data.PlayerLoggedIn.backgroundURL);
    setLoading(false);
  };
  useCustomEventListener("statListUpdate", async (data: any) => {
    // När inventoryt har uppdaterats så ska vi hämta datan igen
    try {
      await UpdateStats();
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  });
  useEffect(() => {
    UpdateStats();
  }, []);
  return (
    <Draggable
      axis="both"
      handle=".handle"
      defaultPosition={{ x: window.innerWidth - 250, y: 10 }}
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("statList")}
    >
      <Card style={{ width: 200 }}>
        <WindowHeader title={"My stats"} />
        {loading ? (
          <p>Loading..</p>
        ) : (
          <Table hover striped style={HideStyle(hideContent)}>
            <tbody>
              <tr>
                <td>Balance</td>
                <td style={{ textAlign: "right" }}>{user?.balance}</td>
              </tr>
            </tbody>
          </Table>
        )}
        {isEditable ? (
          <>
            <p>Background URL</p>
            <input
              value={backgroundURL}
              onChange={(e) => setBackgroundURL(e.target.value)}
            />
            <Button onClick={() => saveUserData()}>Save</Button>
          </>
        ) : (
          <>
            <Button onClick={() => UpdateStats()} size="sm">
              Refresh
            </Button>
            <Button
              style={{ marginTop: 5 }}
              onClick={() => setIsEditable(true)}
              size="sm"
            >
              Edit user data
            </Button>
          </>
        )}
      </Card>
    </Draggable>
  );
}
