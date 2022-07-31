import { Renderer, Common } from "@k8slens/extensions";
import { KubernetesCluster } from "@k8slens/extensions/dist/src/common/catalog-entities";
import { Logger, SCAN_CLUSTER_EVENT_NAME } from "../utils";

function parseScanResult(scanResult: any) {
  const controls = {};
  const frameworks = [];
    
  if (Object.keys(scanResult).length <= 0) {
    Logger.debug({ msg: "Scan cluster ended with no results", result: scanResult })
    return [[], []]
  }

  for (const framework of scanResult) {
    const { controlReports, ...frameworkData } = framework
    for (const control of controlReports) {
      if (control.controlID in controls) {
        continue;
      }
      controls[control.controlID] = control;
    }
        
    frameworks.push(frameworkData);
  }
  return [Object.values(controls), frameworks] as const;
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
  console.debug(scanClusterResult);

  const [controls, frameworks] = parseScanResult(scanClusterResult);

  scanResult = reportStore.scanResults.find(result => result.clusterId == clusterId);

  if (scanResult) {
    // Update Store
    //scanResult.rawResult = ""; // commented out to reduce size of file
    scanResult.controls = controls;
    scanResult.frameworks = frameworks;

    Logger.debug(`Saved scan result of cluster '${clusterName}'`);

    scanResult.isScanning = false;
  } else {
    Logger.error("Scan results error - push was not synced")
  }
}
