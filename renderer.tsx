import React from "react"

import { Renderer, Common } from "@k8slens/extensions";
import { IpcRenderer } from "./src/ipc/renderer";
import { Logger } from "./src/utils/logger";

import {
  ClusterPageIcon,
  ClusterPage,
  KubescapePodDetails,
  KubescapePreferenceInput,
  KubescapePreferenceHint
} from "./src/components";

import {
  KubescapePreferenceStore,
  KubescapeReportStore
} from "./src/stores";

import {
  SCAN_CLUSTER_EVENT_NAME,
  SCAN_CLUSTER_TASK_INTERVAL_MS
} from "./src/utils/consts";

import { parseScanResult } from "./src/kubescape/scanResults";

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

  appPreferences = [
    {
      title: "Kubescape Preferences",
      components: {
        Hint: () => <KubescapePreferenceHint />,
        Input: () => <KubescapePreferenceInput />
      }
    }
  ]

  async onActivate() {
    Logger.debug("Kubescape activated");
    IpcRenderer.createInstance(this);
    KubescapePreferenceStore.createInstance().loadExtension(this);
    KubescapeReportStore.createInstance().loadExtension(this);

    setInterval(() => this.scanClusterTask(), SCAN_CLUSTER_TASK_INTERVAL_MS);
  }

  scanClusterTask = async () => {
    const preferenceStore = KubescapePreferenceStore.getInstance();
    const reportStore = KubescapeReportStore.getInstance();
    const ipc = IpcRenderer.getInstance();

    if (!preferenceStore.isInstalled) {
      Logger.debug('Kubescape is not installed');
      return;
    }
    const activeEntity = Renderer.Catalog.catalogEntities.activeEntity;
    if (!activeEntity || !(activeEntity instanceof Common.Catalog.KubernetesCluster)) {
      Logger.debug('No cluster selected');
      return;
    }

    const clusterId = activeEntity.getId();
    const clusterName = activeEntity.getName();
    if (reportStore.scanResults.find(result => result.clusterId == clusterId)) {
      Logger.debug(`Cluster '${clusterName}' - already scanned`);
      return;
    }

    Logger.debug(`Invoking cluster scan on '${clusterName}'`);
    reportStore.scanResults.push({
      clusterId: clusterId,
      clusterName: clusterName,
      controls: null,
      frameworks: null,
      isScanning: true
    });

    const scanClusterResult = await ipc.invoke(SCAN_CLUSTER_EVENT_NAME, clusterName);
    const [controls, frameworks] = parseScanResult(scanClusterResult);

    // Update Store
    const scanResult = reportStore.scanResults.find(result => result.clusterId == clusterId);
    scanResult.isScanning = false;
    scanResult.controls = controls;
    scanResult.frameworks = frameworks;

    Logger.debug(`Saved scan result of cluster '${clusterName}'`);
  }
}
