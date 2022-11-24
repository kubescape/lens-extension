import { Renderer, Common } from "@k8slens/extensions";
import { KubernetesCluster } from "@k8slens/extensions/dist/src/common/catalog-entities";
import { Logger, SCAN_CLUSTER_EVENT_NAME } from "../utils";

function parseScanResult(scanResult: any) {
  let resourceIdtoResult = {}
  let resourceIdToResource = {}
  for (const resource of scanResult.resources) {
    resourceIdToResource[resource.resourceID] = resource.object
  }

  for (const result of scanResult.results) {
    resourceIdtoResult[result.resourceID] = result.controls

    for (const control of result.controls) {
      scanResult.summaryDetails.controls[control.controlID].resourceIDs[result.resourceID] = result.resourceID
    }
  }
  return [Object.values(scanResult.summaryDetails.controls), resourceIdToResource, resourceIdtoResult] as const;
}

export async function scanClusterTask(preferenceStore, reportStore, ipc) {
  if (!preferenceStore.isInstalled) {
    Logger.debug("Kubescape is not installed");
    return;
  }
  const activeEntity = Renderer.Catalog.catalogEntities.activeEntity;
  if (!activeEntity || !(activeEntity instanceof Common.Catalog.KubernetesCluster)) {
    Logger.debug("No cluster selected");
    return;
  }

  const clusterId = activeEntity.getId();
  const clusterName = activeEntity.getName();

  let scanResult = reportStore.scanResults.find(result => result.clusterId == clusterId);

  if (scanResult) {
    if (!scanResult.isScanning) {
      Logger.debug(`Cluster '${clusterName}' - already scanned`);
      return;
    }
  } else {
    reportStore.scanResults.push({
      clusterId: clusterId,
      clusterName: clusterName,
      controls: null,
      frameworks: null,
      isScanning: true,
      time: Date.now()
    });
  }

  Logger.debug(`Invoking cluster scan on '${clusterName}'`);
  
  const kubeconfigPath = (<KubernetesCluster>activeEntity).spec.kubeconfigPath
  const kubeconfigContext = (<KubernetesCluster>activeEntity).spec.kubeconfigContext
  const scanClusterResult = await ipc.invoke(SCAN_CLUSTER_EVENT_NAME, kubeconfigContext, kubeconfigPath);
  Logger.debug(scanClusterResult);
  
  const [controls, resourceIdToResource, resourceIdToResult] = parseScanResult(scanClusterResult);

  scanResult = reportStore.scanResults.find(result => result.clusterId == clusterId);

  if (scanResult) {
    scanResult.controls = controls;
    scanResult.resourceIdToResource = resourceIdToResource;
    scanResult.resourceIdToResult = resourceIdToResult;

    Logger.debug(`Saved scan result of cluster '${clusterName}'`);

    scanResult.isScanning = false;
  } else {
    Logger.error("Scan results error - push was not synced")
  }
}
