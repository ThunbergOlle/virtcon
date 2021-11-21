import { Item } from "../utils/interfaces";

type ItemPriceChangeReturn = 1 | 0 | -1;
export const ItemPriceChange = (
  newItem: Item,
  oldItems: Item[]
): ItemPriceChangeReturn => {
  const oldPrice = oldItems.find((i) => i.id === newItem.id)?.price;
  const newPrice = newItem.price;
  if (!oldPrice) return 1;
  else if (oldPrice === newPrice) return 0;
  else if (oldPrice > newPrice) return -1;
  else if (oldPrice < newPrice) return 1;
  else return 0;
};
