import React from "react"

import { Renderer } from "@k8slens/extensions";

import { IpcRenderer } from './src/ipc/renderer'
import { KubescapeMainIcon, KubescapeMainPage } from "./src/components/MainPage"
import { KubescapePodDetails } from "./src/kinds/pod-details"
import { Logger } from './src/utils/logger'

export default class KubescapeExtension extends Renderer.LensExtension {
  clusterPages = [
    {
      id: "kubescape-main",
      components: {
        Page: () => <KubescapeMainPage />,
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

  onActivate() {
    Logger.debug("Kubescape activated")

    const ipc = IpcRenderer.createInstance(this);
    // setTimeout(() => ipc.broadcast("initialize", "an-id"), 5000);

  }

}
