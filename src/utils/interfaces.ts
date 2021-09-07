import { ObjectId } from "mongoose";

export interface IntrUser {
  email?: string;
  token?: string;
  balance?: string;
  isLoggedIn?: boolean;
}
export interface IntrPlayer {
  _id: ObjectId;
  plots: ObjectId[];
  display_name: string;
  balance: number;
  inventory: {
    _id: ObjectId;
    item: ObjectId;
    amount: number;
  }[];
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
