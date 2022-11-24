import { Renderer } from "@k8slens/extensions";
import { computed, toJS } from "mobx";
import React from "react";
import { getResourceIdByUid, isFailedResult } from "../kubescape/controlUtils";
import { KubescapeReportStore } from "../stores";
import { KubescapeControlTable, controlTableColumn } from ".";

const {
  Component: { DrawerTitle },
} = Renderer;


export class KubescapeWorkloadDetails<T extends Renderer.K8sApi.KubeObject> extends React.Component<Renderer.Component.KubeObjectDetailsProps<T>> {
  constructor(props) {
    super(props)
  }
  
  @computed get store() {
    return KubescapeReportStore.getInstance();
  }

  render() {
    const rawResourcesMap = toJS<any>(this.store.kubescapeRawResourceMap)    
    const resourceID = getResourceIdByUid(rawResourcesMap, this.props.object.getId())

    let failedControls = []
    if (resourceID == null) {
      console.error("Failed to find resourceID for object", this.props.object.getId())
    } else {
      const failedControlIds = this.store.kubescapeResultMap[resourceID].filter(result => isFailedResult(result)).map(result => result.controlID)
      failedControls = this.store.kubescapeControls.filter((control) => { return failedControlIds.includes(control.id)})
    }
    
    const columns = [controlTableColumn.severity, controlTableColumn.name, controlTableColumn.remediation];
    const sortByDefault = { sortBy: controlTableColumn.severity, orderBy: "desc" }
    return (
      failedControls.length > 0 ?
        <div>
          <DrawerTitle>Kubescape - Failed Controls</DrawerTitle>
          <KubescapeControlTable
            columns={columns}
            controls={failedControls}
            nowrap={false}
            disableRowClick={true}
            sortByDefault={sortByDefault}
            linkToDocsColumnName={controlTableColumn.name}
            descriptionTooltipColumnName={controlTableColumn.name} />
        </div>
        : null
    )
  }
}
