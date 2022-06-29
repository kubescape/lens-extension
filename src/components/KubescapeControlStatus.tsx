import React from "react";
import { Renderer } from "@k8slens/extensions";
import { KubescapeControl } from "../kubescape/types";

const { Component: { Icon }, } = Renderer;

export class KubescapeControlStatus extends React.Component<{ control: KubescapeControl }> {
  render() {
    const { control } = this.props;
    return <Icon material={control.status.icon} style={{ color: control.status.color }} tooltip={control.status.title} />
  }
}
