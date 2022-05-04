import React from "react";
import { Renderer } from "@k8slens/extensions";
import { KubescapeControl } from "../kubescape/types";

const { Component: { Badge }, } = Renderer;

const DisabledColor = '#7b7b7b73'

export class KubescapeControlSeverity extends React.Component<{ control: KubescapeControl, isDisabled?: boolean }> {
    
    render() {
        const { control, isDisabled } = this.props;
        return <Badge style={{ backgroundColor: isDisabled ? DisabledColor : control.severity.color, color: "white", width: 70, textAlign: "center" }} label={control.severity.name} />
    }
}
