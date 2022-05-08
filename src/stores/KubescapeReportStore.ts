import { Common, Renderer } from "@k8slens/extensions";
import { observable, makeObservable, computed, action } from "mobx";
import { KubescapeReportStoreModel, KubescapeClusterScanResult, KubescapeControl } from "../kubescape/types";
import { toKubescapeControl } from "../kubescape/controlUtils";
const { Store } = Common;


export class KubescapeReportStore extends Store.ExtensionStore<KubescapeReportStoreModel> {
    @observable scanResults: KubescapeClusterScanResult[] = [];

    @observable resourceKindToStore: { [kind: string]: Renderer.K8sApi.KubeObjectStore<Renderer.K8sApi.KubeObject> } = {};

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

    @computed get isScanReady() {
        return this.activeClusterReportResult && this.activeClusterReportResult.controls;
    }

    @action scanCluster = () => {
        const filtered = this.scanResults.filter(result => result.clusterId != this.activeClusterId);
        this.scanResults = filtered;
    }

    getStore = (kind, apiVersion) => {
        switch (kind) {
            case "Role":
                return Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.roleApi) as Renderer.K8sApi.RolesStore;
            case "Namespace":
                return (Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.namespacesApi) as unknown) as Renderer.K8sApi.NamespaceStore;
            case "Pod":
                return Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.podsApi) as Renderer.K8sApi.PodsStore;
            case "Deployment":
                return Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.deploymentApi) as Renderer.K8sApi.DeploymentStore;
            case "StatefulSet":
                return Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.statefulSetApi) as Renderer.K8sApi.StatefulSetStore;
            case "DaemonSet":
                return Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.daemonSetApi) as Renderer.K8sApi.DaemonSetStore;
            case "Secret":
                return Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.secretsApi) as Renderer.K8sApi.SecretsStore;
            case "Service":
                return Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.serviceApi) as Renderer.K8sApi.ServiceStore;
            case "VolumeClaim":
                return Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.pvcApi) as Renderer.K8sApi.VolumeClaimStore;
            case "ConfigMap":
                return Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.configMapApi) as Renderer.K8sApi.ConfigMapsStore;
        }

        return Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.apiManager.getApiByKind(kind, apiVersion)) as Renderer.K8sApi.KubeObjectStore<Renderer.K8sApi.KubeObject>;
    }

    getKubeObject = async (kind: string, apiVersion: string, id: string): Promise<Renderer.K8sApi.KubeObject> => {
        const store = this.getStore(kind, apiVersion);

        if (!store.isLoaded) {
            await store.loadAll();
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