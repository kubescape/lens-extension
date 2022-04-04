import { Renderer } from "@k8slens/extensions";
import React from "react";

const {
  Component: {
    DrawerItem,
    DrawerTitle,
  }
} = Renderer;


export class KubescapePodDetails extends React.Component<Renderer.Component.KubeObjectDetailsProps<Renderer.K8sApi.Pod>> {
  render() {
    return (
      <div>
        <DrawerTitle title="Kubescape" />
        <DrawerItem name="Pod Name">
          { this.props.object.getName() }
        </DrawerItem>
      </div>
    )
  }
}
