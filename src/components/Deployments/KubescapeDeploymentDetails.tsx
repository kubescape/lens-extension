import { Renderer } from "@k8slens/extensions";
import { computed } from "mobx";
import React from "react";
import { getFailedControlsById } from "../../kubescape/controlUtils";

const {
  Component: {
    DrawerItem, Table, TableCell, TableRow, TableHead, DrawerTitle
  },
} = Renderer;


export class KubescapeDeploymentDetails extends React.Component<Renderer.Component.KubeObjectDetailsProps<Renderer.K8sApi.Deployment>> {
    @computed get tableRows() {
        const id = this.props.object.getId()
        const controls = getFailedControlsById(id)

        return controls.map(control =>
            <div>
                {control.name}
            </div>
        )
    }

    render() {
        return (
            <div>
                <DrawerTitle title="Kubescape"/>
                {this.tableRows}
            </div>
        )
    }
}
