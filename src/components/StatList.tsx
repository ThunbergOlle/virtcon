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
  const [user, setUser] = useState<Player>();
  const client = useApolloClient();
  const UpdateStats = async () => {
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
  };
  useCustomEventListener("statListUpdate", async (data: any) => {
    // När inventoryt har uppdaterats så ska vi hämta datan igen
    UpdateStats();
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
            <div style={{ textAlign: "right" }}>
              <Button
                size="sm"
                style={{
                  width: 20,
                  height: 20,
                  textAlign: "center",
                  fontSize: 12,
                  padding: 0,
                  backgroundColor: "gray",
                }}
                onClick={() => setHideContent(!hideContent)}
              >
                {hideContent ? "<" : "x"}
              </Button>
            </div>
          </div>
        </Card.Header>

        <Table hover style={HideStyle(hideContent)}>
          <tbody>
            <tr>
              <td>Balance</td>
              <td style={{ textAlign: "right" }}>{user?.balance}</td>
            </tr>
          </tbody>
        </Table>
      </Card>
    </Draggable>
  );
}
