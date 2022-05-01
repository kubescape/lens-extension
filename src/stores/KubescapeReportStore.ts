import { Common, Renderer } from "@k8slens/extensions";
import { observable, makeObservable, computed, action } from "mobx";

const { Store } = Common;

export type KubescapeClusterScanResult = {
    clusterId: string;
    clusterName: string;
    controls: any;
    frameworks: any;
    isScanning: boolean;
}

export type KubescapeReportStoreModel = {
    scanResults: KubescapeClusterScanResult[];
}

export type KubescapeControl = {
    id: string;
    name: string;
    failedResources: number;
    allResources: number;
    riskScore: number;
    description: string;
    remediation: string;
}

export class KubescapeReportStore extends Store.ExtensionStore<KubescapeReportStoreModel> {
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
        return this.activeClusterReportResult.controls.map((control) => {
            return {
                id: control.id,
                name: control.name,
                failedResources: control.failedResources,
                allResources: control.totalResources,
                riskScore: control.score,
                description: control.description,
                remediation: control.remediation
            }
        });
    }

    @computed get isScanReady() {
        return this.activeClusterReportResult && this.activeClusterReportResult.controls;
    }

    @action scanCluster = () => {
        const filtered = this.scanResults.filter(result => result.clusterId != this.activeClusterId);
        this.scanResults = filtered;
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