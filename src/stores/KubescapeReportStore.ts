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


    getKubeObject = async (namespace: string, kind: string, apiVersion: string, id: string): Promise<Renderer.K8sApi.KubeObject> => {
        let store;
        switch (kind) {
            case "Role":
                store = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.roleApi) as Renderer.K8sApi.RolesStore;
                break;
            default:
                store = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.apiManager.getApiByKind(kind, apiVersion)) as Renderer.K8sApi.KubeObjectStore<Renderer.K8sApi.KubeObject>;
        }
       
        await store.loadAll({ namespaces: [namespace], merge: false });
        console.error(kind, apiVersion, id);
        console.error(store);

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