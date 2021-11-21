import socketio, { Socket } from "socket.io-client";

import React from "react";
import { Config } from "../utils/Config";

export const socket = socketio(Config.baseUrl, {
  rejectUnauthorized: false,
});
export const SocketContext = React.createContext<Socket<any, any>>(socket);
