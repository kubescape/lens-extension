import { Common } from "@k8slens/extensions";
import { observable, makeObservable } from "mobx";

const { Store } = Common;

export type KubescapeClusterScanResult = {
    clusterId: string;
    clusterName: string;
    result: any;
    isScanning: boolean;
}

export type KubescapeReportStoreModel = {
    scanResults: KubescapeClusterScanResult[];
}

export class KubescapeReportStore extends Store.ExtensionStore<KubescapeReportStoreModel> {
    @observable scanResults: KubescapeClusterScanResult[] = [];

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