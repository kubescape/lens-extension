import React from "react"

import { reaction } from "mobx";
import { Renderer, Common } from "@k8slens/extensions";
import { IpcRenderer } from "./src/ipc/renderer";
import { Logger } from "./src/utils/logger";

import {
  ClusterPageIcon,
  ClusterPage,
  KubescapeWorkloadDetails
} from "./src/components";

import {
  KubescapePreferenceStore,
  KubescapeReportStore
} from "./src/stores";

import { scanClusterTask } from "./src/kubescape/clusterScan";


export default class KubescapeExtension extends Renderer.LensExtension {
  clusterPages = [
    {
      id: "kubescape-main",
      components: {
        Page: () => <ClusterPage />,
      }
    }
  ]

  /* Sidebar menu */
  clusterPageMenus = [
    {
      target: { pageId: "kubescape-main" },
      title: "Kubescape",
      components: {
        Icon: ClusterPageIcon,
      }
    }
  ]

  /* workload object details */
  kubeObjectDetailItems = [
    {
      kind: "Node",
      apiVersions: ["v1"],
      priority: 9,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Renderer.K8sApi.Node>) => <KubescapeWorkloadDetails<Renderer.K8sApi.Node> {...props} />
      }
    },
    {
      kind: "Pod",
      apiVersions: ["v1"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Renderer.K8sApi.Pod>) => <KubescapeWorkloadDetails<Renderer.K8sApi.Pod> {...props} />
      }
    },
    {
      kind: "Deployment",
      apiVersions: ["apps/v1"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Renderer.K8sApi.Deployment>) => <KubescapeWorkloadDetails<Renderer.K8sApi.Deployment> {...props} />
      }
    },
    {
      kind: "DaemonSet",
      apiVersions: ["apps/v1"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Renderer.K8sApi.DaemonSet>) => <KubescapeWorkloadDetails<Renderer.K8sApi.DaemonSet> {...props} />
      }
    },
    {
      kind: "StatefulSet",
      apiVersions: ["apps/v1"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Renderer.K8sApi.StatefulSet>) => <KubescapeWorkloadDetails<Renderer.K8sApi.StatefulSet> {...props} />
      }
    },
    {
      kind: "ReplicaSet",
      apiVersions: ["apps/v1"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Renderer.K8sApi.ReplicaSet>) => <KubescapeWorkloadDetails<Renderer.K8sApi.ReplicaSet> {...props} />
      }
    },
    {
      kind: "ServiceAccount",
      apiVersions: ["v1"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Renderer.K8sApi.ServiceAccount>) => <KubescapeWorkloadDetails<Renderer.K8sApi.ServiceAccount> {...props} />
      }
    },
    {
      kind: "CronJob",
      apiVersions: ["batch/v1beta1"],
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Renderer.K8sApi.CronJob>) => <KubescapeWorkloadDetails<Renderer.K8sApi.CronJob> {...props} />
      },
    },
  ]

  // appPreferences = [
  //   {
  //     title: "Kubescape Preferences",
  //     components: {
  //       Hint: () => <KubescapePreferenceHint />,
  //       Input: () => <KubescapePreferenceInput />
  //     }
  //   }
  // ]

  disposers = []

  async onActivate() {
    Logger.debug("Kubescape activated");
    const ipc = IpcRenderer.createInstance(this);
    const preferenceStore = KubescapePreferenceStore.createInstance();
    preferenceStore.loadExtension(this);
    const reportStore = KubescapeReportStore.createInstance();
    reportStore.loadExtension(this);    

    this.disposers.push(reaction(() => Renderer.Catalog.catalogEntities.activeEntity, async () => await scanClusterTask(preferenceStore, reportStore, ipc)));
    this.disposers.push(reaction(() => preferenceStore.isInstalled, async () => await scanClusterTask(preferenceStore, reportStore, ipc)));
  }

  async onDeactivate() {
    Logger.debug("Kubescape deactivated");
    this.disposers.forEach((disposer) => disposer());
  } 
}
