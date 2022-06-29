export type ControlStatus = {
    title: string;
    icon: string;
    value: number;
    color: string;
}

export type Severity = {
    name: string;
    value: number;
    color: string;
}

export type KubescapeClusterScanResult = {
    clusterId: string;
    clusterName: string;
    controls: any;
    frameworks: any;
    isScanning: boolean;
    time: number;
    rawResult: any;
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
    severity: Severity;
    status: ControlStatus;
    rawResult: any;
}
