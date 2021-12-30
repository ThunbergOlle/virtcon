import { ObjectId } from "mongoose";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
};

export type Query = {
  __typename?: "Query";
  Players: Array<Player>;
  PlayerLoggedIn: Player;
  Item: Array<Item>;
};

export type QueryItemArgs = {
  filter?: Maybe<ItemFilter>;
};
export type Award = {
  id: Scalars["Int"];
  name: string;
  color: string;
  descr: string;
};
export type PlayerAward = {
  id: Scalars["Int"];
  amount: Scalars["Int"];
  timestamp: Date;
  award: Award;
  player: Player;
};
export type Player = {
  __typename?: "Player";
  id: Scalars["Int"];
  display_name: Scalars["String"];
  backgroundURL: Scalars["String"];
  email: Scalars["String"];
  last_login?: Maybe<Scalars["DateTime"]>;
  balance: Scalars["Int"];
  inventory?: Maybe<Array<InventoryItem>>;
  plot?: Maybe<Array<Plot>>;
  awards?: PlayerAward[];
  hasBlackMarketAccess?: boolean;
};

export type PlotGrid = {
  id: number;

  plot: Plot;

  x: number;

  y: number;

  building?: PlotBuildings;

  resource?: PlotResources;
};

export type InventoryItem = {
  __typename?: "InventoryItem";
  id: Scalars["Int"];
  amount: Scalars["Int"];
  item: Item;
  building: Building;
};

export type Item = {
  __typename?: "Item";
  id: Scalars["Int"];
  price: Scalars["Int"];
  type: Scalars["String"];
  spawn_rate: Scalars["Float"];
  name: Scalars["String"];
  market_name: Scalars["String"];
  rarity: Scalars["String"];
};
export type BuildingConsumesItem = {
  id: Scalars["Int"];
  item: Item;
  amount: Scalars["Int"];
};
export type BuildingRecipe = {
  id: number;
  building: Building;
  item: Item;
  amount: number;
};
export type Building = {
  __typename?: "Building";
  id: Scalars["Int"];
  total_amount_placed: Scalars["Int"];
  name: Scalars["String"];
  consumes_items: BuildingConsumesItem[];
  hacked: Scalars["Boolean"];
  outputItem: Item;
  output_amount: Scalars["Int"];
  electricityUsed?: Scalars["Int"];
  electricityGenerated?: Scalars["Int"];

  recipe: BuildingRecipe[];
};
export type ProductionOverviewItem = {
  item: Item;

  producing: number;

  consuming: number;
};

export type ElectricalPriceOverviewItem = {
  producing: number;

  consuming: number;
  price: number;
};
export type Plot = {
  __typename?: "Plot";
  id: Scalars["Int"];
  max_buildings: Scalars["Int"];
  buildings: PlotBuildings[];
  resources: PlotResources[];
  grid: PlotGrid[];
  lastPrice: number;
  askedPrice: number;
  owner?: Player;
};

export type PlotBuildings = {
  __typename?: "PlotBuildings";
  id: Scalars["Int"];
  plot: Plot;
  occupiesResource: PlotResources;
  building: Building;
};

export type PlotResources = {
  __typename?: "PlotResources";
  id: Scalars["Int"];
  plot: Plot;
  resource: Item;
  amount: Scalars["Int"];
  amountUsed: Scalars["Int"];
};

export type ItemFilter = {
  id?: Maybe<Scalars["Int"]>;
  name?: Maybe<Scalars["String"]>;
  market_name?: Maybe<Scalars["String"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  PlayerNew: Player;
  PlayerLogin: LoginPlayerToken;
  ServerShopPurchase: ServerShopResponse;
};

export type MutationPlayerNewArgs = {
  options: PlayerNewInput;
};

export type MutationPlayerLoginArgs = {
  options: PlayerLoginInput;
};

export type MutationServerShopPurchaseArgs = {
  name: Scalars["String"];
};

export type PlayerNewInput = {
  email: Scalars["String"];
  password: Scalars["String"];
  display_name: Scalars["String"];
};

export type PlayerLoginInput = {
  email: Scalars["String"];
  password: Scalars["String"];
};

export type LoginPlayerToken = {
  __typename?: "LoginPlayerToken";
  id: Scalars["Int"];
  display_name: Scalars["String"];
  email: Scalars["String"];
  last_login?: Maybe<Scalars["DateTime"]>;
  balance: Scalars["Int"];
  inventory?: Maybe<Array<InventoryItem>>;
  plot?: Maybe<Array<Plot>>;
  token: Scalars["String"];
};

export type ServerShopResponse = {
  __typename?: "ServerShopResponse";
  success: Scalars["Boolean"];
  balance_new: Scalars["Int"];
};
export type MarketListing = {
  id?: number;
  amount?: number;
  price?: number;
  isSellOrder?: boolean;
  executed?: string;
  player?: Player;
  item?: Item;
};
export type ServerShopPrices = {
  name: string;
  price: number;
};
/*
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
export interface PlayerInventory {
  _id: ObjectId;
  item: ObjectId;
  amount: number;
}
export interface Player {
  _id: ObjectId | undefined;
  plots?: IntrPlot[];
  display_name: string;
  balance: number;
  inventory?: PlayerInventory[];
  last_login: Date;
  email: string;
  token: string;
}
export interface IntrItem {
  name: string;
  market_name: string;
  spawn_rate: number;
  id: number;
  type: string;
  rarity: string;
}
*/
