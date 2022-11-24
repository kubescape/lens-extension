import { Common, Renderer } from "@k8slens/extensions";
import { observable, makeObservable, computed } from "mobx";
import { KubescapeReportStoreModel, KubescapeClusterScanResult, KubescapeControl } from "../kubescape/types";
import { toKubescapeControl } from "../kubescape/controlUtils";


export class KubescapeReportStore extends Common.Store.ExtensionStore<KubescapeReportStoreModel> {
    @observable scanResults: KubescapeClusterScanResult[] = [];

    @computed get activeCluster() {
      const activeEntity = Renderer.Catalog.catalogEntities.activeEntity;
      if (activeEntity && activeEntity instanceof Common.Catalog.KubernetesCluster) {
        return activeEntity;
      }
      return null;
    }

    @computed get activeClusterId() {
      return this.activeCluster?.getId() ?? null;
    }

    @computed get activeClusterReportResult() {
      if (!this.activeClusterId) {
        return null;
      }
      return this.scanResults.find(result => result.clusterId == this.activeClusterId);
    }

    @computed get kubescapeControls(): KubescapeControl[] {
      if (!this.activeClusterReportResult || !this.activeClusterReportResult.controls) {
        return null;
      }
      return this.activeClusterReportResult.controls.map(control => toKubescapeControl(control));
    }

    @computed get kubescapeResultMap() {
      if (!this.activeClusterReportResult || !this.activeClusterReportResult.controls) {
        return null;
      }
      return this.activeClusterReportResult.resourceIdToResult;
    }
    
    @computed get kubescapeRawResourceMap() {
      if (!this.activeClusterReportResult || !this.activeClusterReportResult.controls) {
        return null;
      }
      return this.activeClusterReportResult.resourceIdToResource;
    }

    @computed get isScanReady() {
      return this.activeClusterReportResult && this.activeClusterReportResult.controls;
    }

    getKubeObject = async (namespace : string, kind: string, apiVersion: string, id: string): Promise<Renderer.K8sApi.KubeObject> => {
      
      const kubeApi = Renderer.K8sApi.apiManager.getApiByKind(kind, apiVersion);
      if (kubeApi == null) {
        console.error(`Could not find api for kind ${kind} and apiVersion ${apiVersion}`);
        return null
      }

     
      const store = Renderer.K8sApi.apiManager.getStore(kubeApi)
      if (store == null) {
        console.error("Could not find store for kind: " + kind + " apiVersion: " + apiVersion);
        return null;
      }

      if (!store.isLoaded || !store.getById(id)) {
        await store.loadAll({ namespaces: [namespace], merge: false });
      }

      return store.getById(id);
    }

    constructor() {
      super({
        configName: "kubescape-report-store",
        defaults: {
          scanResults: []
        }
      });
      makeObservable(this);
    }

    protected fromStore({ scanResults }: KubescapeReportStoreModel): void {
      this.scanResults = scanResults
    }

    toJSON(): KubescapeReportStoreModel {
      return {
        scanResults: this.scanResults
      };
    }
}