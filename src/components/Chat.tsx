import { useContext, useEffect, useRef, useState } from "react";
import { Button, Card } from "react-bootstrap";
import Draggable from "react-draggable";
import { toast } from "react-toastify";
import { PlayerContext } from "../context/PlayerContext";
import { SocketContext } from "../context/SocketContext";
import { WindowTypes } from "../pages/index/IndexPage";
import { HideStyle } from "../utils/HideStyle";
import { PlayerAward } from "../utils/interfaces";
import AwardDisplayer from "./AwardDisplayer";
import WindowHeader from "./WindowHeader";
interface Message {
  sender: {
    display_name: string;
    id: number;
    awards: PlayerAward[];
    canSendLinks: boolean;
  };
  color?: string;
  bold?: boolean;
  message: string;
  timestamp: Date;
}
export default function Chat(props: {
  isOpen: boolean;
  className: string;
  onFocus: (windowType: WindowTypes) => void;
  onClose: (windowType: WindowTypes) => void;
}) {
  const [message, setMessage] = useState<string>("");
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const [online, setOnline] = useState<number>(0);
  const socket = useContext(SocketContext);
  const player = useContext(PlayerContext);
  const messageRef: React.MutableRefObject<any> = useRef(null);
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current!.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [messageHistory]);
  const sendMessage = () => {
    const token = sessionStorage.getItem("token");
    console.log(message);
    socket.emit("chatNew", { token: token, message: message });
    setMessage("");
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    socket.emit("chatConnect", { token: token });

    let messageHistory: Message[] = [];
    socket.on(
      "chatNew",
      (data: {
        display_name: string;
        id: number;
        message: string;
        color: string;
        awards: PlayerAward[];
        bold: boolean;
        canSendLinks: boolean;
      }) => {
        console.log("New chat: " + data.message);
        const formattedObject: Message = {
          sender: {
            display_name: data.display_name,
            id: data.id,
            awards: data.awards,
            canSendLinks: data.canSendLinks,
          },
          message: data.message,
          color: data.color,
          bold: data.bold,
          timestamp: new Date(),
        };
        messageHistory.push(formattedObject);
        if (formattedObject.sender.id !== player.id)
          toast(
            `${
              formattedObject.sender.display_name
            }: ${formattedObject.message.replaceAll(";break;", "\n\n")}`,
            {
              type: "default",
              hideProgressBar: true,
              pauseOnHover: false,
              style: {
                color: formattedObject.color,
                fontWeight: formattedObject.bold ? "bold" : "normal",
              },
              autoClose: 2500,
              position: "bottom-left",
            }
          );
        setMessageHistory([...messageHistory]);
      }
    );

    socket.on("chatOnline", (data: { online: number }) => {
      setOnline(data.online);
    });

    return () => {
      //  socket.disconnect();
      socket.emit("chatDisconnect");
    };
  }, []);
  const load = () => {};
  useEffect(() => {
    load();
  }, []);

  return (
    <Draggable
      axis="both"
      handle=".handle"
      bounds={{ top: 0 }}
      defaultPosition={{ x: 40, y: 10 }}
      defaultClassName={props.className}
      onMouseDown={() => props.onFocus("chat")}
    >
      <Card style={{ width: 350, ...HideStyle(!props.isOpen) }}>
        <WindowHeader title="Chat" onClose={() => props.onClose("chat")} />
        <div
          style={{
            overflowY: "scroll",
            display: "flex",
            flexDirection: "column",
            height: 400,
          }}
        >
          {messageHistory.map((i) => (
            <div
              style={{
                marginInline: 10,
                marginBottom: 0,
                marginTop: 0,
                maxWidth: 350,
              }}
            >
              <p
                style={{
                  color: i.color || "gray",
                  display: "inline-block",
                  marginRight: 10,
                  fontWeight: i.bold ? "bold" : "normal",
                }}
              >
                {i.sender.display_name}{" "}
                <AwardDisplayer
                  key={i.sender.id + "awardDisplayer"}
                  keyId={String(i.sender.id)}
                  awards={i.sender.awards}
                  useBrackets
                />
                :
              </p>
              {i.message.split(";break;").map((message) => (
                <p
                  style={{
                    color: i.color || "black",
                    display: "inline-block",
                    maxWidth: 350,
                  }}
                >
                  {/* Check if the message includes http, if it does create a link for that section */}
                  {message.includes("http") ? (
                    <>
                      {message.split(" ").map((word) => {
                        if (word.includes("http")) {
                          return (
                            <a
                              href={word}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {word}
                            </a>
                          );
                        } else {
                          return ` ${word} `;
                        }
                      })}
                    </>
                  ) : (
                    message
                  )}
                </p>
              ))}
            </div>
          ))}
          <div ref={messageRef} />
        </div>
        <p style={{ color: "green", marginBottom: 0, marginLeft: 10 }}>
          {online} online
        </p>
        <div>
          <input
            type="text"
            style={{
              width: "80%",
              display: "inline-block",
              height: 35,
            }}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            onKeyDown={(e) => {
              console.log(e.key);
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <Button
            size="sm"
            style={{ margin: 0, marginTop: "-3px", width: "20%", height: 35 }}
            onClick={sendMessage}
          >
            Send
          </Button>
        </div>
      </Card>
    </Draggable>
  );
}
