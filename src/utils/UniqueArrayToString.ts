export const UniqueArrayToString = (
  arr: Array<any>,
  noFoundString: string,
  key1: string,
  key2?: string
) => {
  return (
    Array.from(
      new Set(
        arr.map((b, i) => {
          let beginning = " ";
          if (key2) return beginning + b[key1][key2];
          else return beginning + b[key1];
        })
      )
    )
      .toString()
      .substring(1) || noFoundString
  );
};
