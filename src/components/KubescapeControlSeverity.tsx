import React from "react";
import { Renderer } from "@k8slens/extensions";
import { KubescapeControl } from "../kubescape/types";

const { Component: { Badge }, } = Renderer;

export class KubescapeControlSeverity extends React.Component<{ control: KubescapeControl, isDisabled?: boolean }> {
    
  render() {
    const { control, isDisabled } = this.props;
    const bgColor = isDisabled ? `${control.severity.color}66` : control.severity.color;
    return <Badge style={{ backgroundColor: bgColor , color: "white", width: 70, textAlign: "center" }} label={control.severity.name} />
  }
}
