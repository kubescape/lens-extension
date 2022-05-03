import { KubeObject } from "@k8slens/extensions/dist/src/common/k8s-api/kube-object"
import { Logger } from "../utils"
import { KubescapeControl, Severity } from "./types"

const SeverityNone = "None"
const SeverityCritical = "Critical"
const SeverityHigh = "High"
const SeverityMedium = "Medium"
const SeverityLow = "Low"
const SeverityUnknown = "Unknown"

function calculateSeverity(control: any): Severity {
    const baseScore = control.baseScore
    if (control.failedResources == 0) {
        return {
            name: SeverityNone,
            value: 0,
            color: "#23a71b"
        }
    }
    if (baseScore >= 9) {
        return {
            name: SeverityCritical,
            value: baseScore,
            color: "#7b2936"
        }
    }
    if (baseScore >= 7) {
        return {
            name: SeverityHigh,
            value: baseScore,
            color: "#cc4d4a"
        }
    }
    if (baseScore >= 4) {
        return {
            name: SeverityMedium,
            value: baseScore,
            color: "#e48547"
        }
    }
    if (baseScore >= 1) {
        return {
            name: SeverityLow,
            value: baseScore,
            color: "#bf9745"
        }
    }
    return {
        name: SeverityUnknown,
        value: baseScore,
        color: "#87909c"
    }
}


export function toKubescapeControl(control: any): KubescapeControl {
    return {
        id: control.id,
        name: control.name,
        failedResources: control.failedResources,
        allResources: control.totalResources,
        riskScore: control.score,
        description: control.description,
        remediation: control.remediation,
        severity: calculateSeverity(control)
    }
}

export function toKubeObject(kubeObject : any) : KubeObject {
    try {
        return {
            kind : kubeObject.kind,
            apiVersion : kubeObject.apiVersion,
            metadata : kubeObject.metadata,
            selfLink : kubeObject.metadata.selfLink,
            getId : () => kubeObject.metadata.name,
            getAge : () => kubeObject.metadata.creationTimestamp,
            getAnnotations : () => kubeObject.metadata.annotations,
            getLabels : ()=> kubeObject.metadata.labels,
            getName : () => kubeObject.metadata.name,
            getResourceVersion : () => kubeObject.metadata.resourceVersion,
            getNs : () => kubeObject.metadata.namespace,
            getOwnerRefs : () => kubeObject.metadata.ownerReferences,
            getFinalizers : () => [],
            getSearchFields : () => undefined,
            getTimeDiffFromNow : () => Date.now() - Date.parse(kubeObject.metadata.creationTimestamp),
            toPlainObject : () => kubeObject,
            managedFields : () => kubeObject.metadata.managedFields,
            delete : undefined,
            patch : undefined,
            update : undefined
        }
    }
    catch {
        Logger.debug(`not a KubeObject ${JSON.stringify(kubeObject)}`)
        return null
    }
}

export function getFailedControlsById(controls: any[], id: string): KubescapeControl[] {
    return controls.filter(control =>
        control.failedResources > 0 && control.ruleReports?.some(report =>
            report.failedResources > 0 && report.ruleResponses?.some(response =>
                response.alertObject.k8sApiObjects.some(k8sObj => {
                    if (k8sObj.apiVersion) {
                        return k8sObj.metadata.uid == id
                    }
                    return k8sObj.apiGroup ?
                        k8sObj.relatedObjects.some(relatedObj => relatedObj.metadata.uid == id) : false
                }))
        )
    ).map(control => toKubescapeControl(control));
}

export function getRelatedObjectsFromControl(control: any): any[] {
    let result: any[] = []

    control.ruleReports?.forEach(report => {
        if (report.failedResources > 0) {
            report.ruleResponses?.forEach(response => {
                response.alertObject.k8sApiObjects.forEach(k8sObj => {
                    result.push(k8sObj)
                    k8sObj.relatedObjects?.forEach(relatedObject => {
                        result.push(relatedObject)
                    })
                })
            })
        }
    })
    return result
}

export function docsUrl(control: KubescapeControl): string {
    return `https://hub.armo.cloud/docs/${control.id.toLocaleLowerCase()}`;
}
