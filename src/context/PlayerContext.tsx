import React from "react";
import { Player } from "../utils/interfaces";

export const PlayerContext = React.createContext<Partial<Player>>({});
/*
export const PlayerContext = React.createContext<Player>({
  display_name: "",
  plots: [],
  balance: 0,
  inventory: [],
  last_login: new Date(),
  email: "",
  token: "",
  _id: undefined,
});
*/
