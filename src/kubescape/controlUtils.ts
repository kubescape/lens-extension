import { toJS } from "mobx"
import { KubescapeReportStore } from "../stores/KubescapeReportStore"

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
