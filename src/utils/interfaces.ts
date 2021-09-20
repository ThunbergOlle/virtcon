import { ObjectId } from "mongoose";

export interface IntrUser {
  email?: string;
  token?: string;
  balance?: string;
  isLoggedIn?: boolean;
}
export interface IntrBuilding {
  _id: string;
  building: string;
  upgrades: string[];
  generatesPerHour: number;
  generates: string[];
  material_name: string;
  hacked: boolean;
  date_hacked: Date;
  consumes: string;
  consumesPerHour: number;
}
export interface IntrPlot {
  highest_bid: number;
  is_owned: boolean;
  created: Date;
  _id: string;
  max_tiles: number;
  total_revenue_generated: number;
  raw_material_available: String[];
  buildings: IntrBuilding[];
}
export interface IntrPlayerInventory {
  _id: ObjectId;
  item: ObjectId;
  amount: number;
}
export interface IntrPlayer {
  _id: ObjectId;
  plots: IntrPlot[];
  display_name: string;
  balance: number;
  inventory: IntrPlayerInventory[];
  last_login: Date;
  email: string;
  token: string;
}
export interface IntrItem {
  name: string;
  market_name: string;
  spawn_rate: number;
  type: string;
  _id: string;
  __typename: string;
}
