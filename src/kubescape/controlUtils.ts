import { toJS } from "mobx"
import { KubescapeReportStore } from "../stores/KubescapeReportStore"

const SeverityCritical = "Critical"
const SeverityHigh     = "High"
const SeverityMedium   = "Medium"
const SeverityLow      = "Low"
const SeverityUnknown  = "Unknown"

export type Severity = {
    name : string,
    value : number,
    color : string
}


export function getFailedControlsById(id : string) {
    const controls = toJS<any[]>(KubescapeReportStore.getInstance().activeClusterReportResult.controls)
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
    )
}

export function calculateSeverity(control : any) : Severity {
    console.log(control)
    const baseScore = control.baseScore
	if (baseScore >= 9) {
		return {
            name : SeverityCritical,
            value : baseScore,
            color : "#7b2936"
        }
	}
	if (baseScore >= 7) {
		return {
            name : SeverityHigh,
            value : baseScore,
            color : "#cc4d4a"
        }
	}
	if (baseScore >= 4) {
		return {
            name : SeverityMedium,
            value : baseScore,
            color : "#e48547"
        }
	}
	if (baseScore >= 1) {
		return {
            name : SeverityLow,
            value : baseScore,
            color : "#bf9745"
        }
	}
	return {
        name: SeverityUnknown,
        value: baseScore,
        color: "#87909c"
    }
}
