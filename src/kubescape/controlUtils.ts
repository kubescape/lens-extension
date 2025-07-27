import { json } from "@k8slens/extensions/dist/src/common/utils"
import { toJS } from "mobx"
import { KubescapeControl, Severity, ControlStatus } from "./types"

const SeverityCritical = "Critical"
const SeverityHigh = "High"
const SeverityMedium = "Medium"
const SeverityLow = "Low"
const SeverityUnknown = "Unknown"

function calculateSeverity(control: any): Severity {
  const baseScore = control.scoreFactor
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

Object.defineProperty(String.prototype, 'capitalize', {
  value: function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false
});


function calculateStatus(control: any): ControlStatus {
  if (control.statusInfo.status == "passed") {
    return {
      title: "Passed",
      icon: "check_circle_outline",
      value: 1,
      color: "#23a71b"
    }
  }

  if (control.statusInfo.status == "failed") {
    return {
      title: "Failed",
      icon: "highlight_off",
      value: 10,
      color: "#e1449f"
    }
  }

  return {
    title: control.statusInfo.status.capitalize(),
    icon: "help_outline",
    value: 0,
    color: "gray"
  }
}


export function toKubescapeControl(control: any): KubescapeControl {
  return {
    id: control.controlID,
    name: control.name,
    failedResources: control.ResourceCounters.failedResources,
    allResources: totalResources(control),
    riskScore: control.score,
    description: control.description,
    remediation: control.remediation,
    severity: calculateSeverity(control),
    status: calculateStatus(control),
    relatedResourceIds: Object.keys(control.resourceIDs)
  }
}

export function totalResources(control: any): number {
  let total = 0
  for (const key in control.ResourceCounters) {
    total += control.ResourceCounters[key]
  }
  return total
}

export function getResourceIdByUid(rawResourcesMap: any, id: string): string {
  for (let key of Object.keys(rawResourcesMap)) {
    if (rawResourcesMap[key]?.metadata?.uid === id) {
      return key
    }
  }

  return null
}

export function getRelatedObjectsFromControl(control: KubescapeControl, resourceIdToResultMap: any, resourceIdToRawResourceMap: any): any[] {
  const relatedObjects: any[] = []
  control.relatedResourceIds.map((resourceId) => {
    const results = resourceIdToResultMap[resourceId]
    results.map((resultObject: any) => {
      if (resultObject.controlID == control.id && isFailedResult(resultObject)) {
        const rawResource = resourceIdToRawResourceMap[resourceId]
        relatedObjects.push(toJS(rawResource))
     }
    })
  })

  return relatedObjects
}

export function isFailedResult(resultObject: any): boolean {
  return resultObject.rules.some(rule => rule.status == 'failed' && !rule.hasOwnProperty('exception'))
}

export function docsUrl(control: KubescapeControl): string {
  return `https://kubescape.io/docs/controls/${control.id.replaceAll('.', '-').toLocaleLowerCase()}`;
}
