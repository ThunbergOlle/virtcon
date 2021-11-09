import React from "react";
import { Card } from "react-bootstrap";
import { HideStyle } from "../../utils/HideStyle";

export const withCard = <P extends object>(
  Component: React.ComponentType<any>,
  width: number
) =>
  class withCard extends React.Component<any> {
    render() {
      return (
        <Card style={{ width: width, ...HideStyle(!this.props.isOpen) }}>
          {" "}
          <Component {...(this.props as P)} />{" "}
        </Card>
      );
    }
  };
