import { Renderer } from "@k8slens/extensions";
import { toJS } from "mobx";
import React from "react";
import { getFailedControlsById } from "../kubescape/controlUtils";
import { KubescapeReportStore } from "../stores";
import { KubescapeControlTable, controlTableColumn } from ".";

const {
  Component: { DrawerTitle },
} = Renderer;


export class KubescapeWorkloadDetails<T extends Renderer.K8sApi.KubeObject> extends React.Component<Renderer.Component.KubeObjectDetailsProps<T>> {
  constructor(props) {
    super(props)
  }
  render() {
    const controls = toJS<any[]>(KubescapeReportStore.getInstance().activeClusterReportResult.controls)
    const failedControls = getFailedControlsById(controls, this.props.object.getId())

    const columns = [controlTableColumn.severity, controlTableColumn.name, controlTableColumn.remediation];
    const sortByDefault = { sortBy: controlTableColumn.id, orderBy: "desc" }
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
