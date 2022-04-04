import { Renderer } from "@k8slens/extensions";
import { KubescapeMainIcon, KubescapeMainPage } from "./src/main-page"
import { KubescapePodDetails } from "./src/kinds/pod-details"
import React from "react"

export default class KubescapeExtension extends Renderer.LensExtension {
  clusterPages = [
    {
      id: "kubescape-main",
      components: {
        Page: () => <KubescapeMainPage extension={this}/>,
      }
    }
  ]

  /* Sidebar menu */
  clusterPageMenus = [
    {
      target: { pageId: "kubescape-main" },
      title: "Kubescape",
      components: {
        Icon: KubescapeMainIcon,
      }
    }
  ]

  /* add to pod metadata */
  kubeObjectDetailItems = [
    {
      kind: "Pod",
      apiVersions: ["v1"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Renderer.K8sApi.Pod>) => <KubescapePodDetails {...props} />
      }
    }
  ]

  async onActivate() {
    console.log("Kubescape activated")
  }
}
