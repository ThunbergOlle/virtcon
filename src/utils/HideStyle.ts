import React from "react";
export const HideStyle = (isHidden: boolean): React.CSSProperties => {
  return isHidden ? { opacity: 0, zIndex: -99 } : { opacity: 1 };
};
