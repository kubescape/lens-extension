import React from "react";
import { Renderer } from "@k8slens/extensions";
import { KubescapeControl } from "../kubescape/types";

const { Component: { Badge }, } = Renderer;

export class KubescapeControlSeverity extends React.Component<{ control: KubescapeControl }> {
    render() {
        const { control } = this.props;
        return <Badge style={{ backgroundColor: control.severity.color, color: "white", width: 70, textAlign: "center" }} label={control.severity.name} />
    }
}
