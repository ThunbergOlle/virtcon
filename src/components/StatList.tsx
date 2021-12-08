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
import { HideStyle } from "../utils/HideStyle";
import { Player } from "../utils/interfaces";
export default function StatList(props: any) {
  const [hideContent, setHideContent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<Player>();
  const client = useApolloClient();
  const UpdateStats = async () => {
    setLoading(true);
    const query = gql`
      query {
        PlayerLoggedIn {
          id
          email
          display_name
          balance
        }
      }
    `;
    let data = await client.query({
      query: query,
    });
    setUser(data.data.PlayerLoggedIn);
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
    >
      <Card style={{ width: 200 }}>
        <Card.Header className="handle">
          <div style={{ display: "flex" }}>
            <p style={{ flex: 1 }}>My statistics</p>
            <div style={{ textAlign: "right" }}></div>
          </div>
        </Card.Header>
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
        <Button onClick={() => UpdateStats()} size="sm">
          Refresh
        </Button>
      </Card>
    </Draggable>
  );
}
