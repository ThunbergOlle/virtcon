export const MoneyFormatter = Intl.NumberFormat("en", {
  notation: "compact",
  style: "currency",
  minimumSignificantDigits: 4,
  maximumSignificantDigits: 4,
  currency: "USD",
});
