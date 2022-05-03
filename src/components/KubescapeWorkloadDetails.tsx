import { Renderer } from "@k8slens/extensions";
import { WorkloadKubeObject } from "@k8slens/extensions/dist/src/common/k8s-api/workload-kube-object";
import { toJS } from "mobx";
import React from "react";
import { getFailedControlsById } from "../kubescape/controlUtils";
import { KubescapeReportStore } from "../stores";
import { KubescapeControlTable, sortBy } from ".";

const {
    Component: { DrawerTitle },
} = Renderer;


export class KubescapeWorkloadDetails<T extends WorkloadKubeObject> extends React.Component<Renderer.Component.KubeObjectDetailsProps<T>> {
    constructor(props) {
        super(props)
    }
    render() {
        const controls = toJS<any[]>(KubescapeReportStore.getInstance().activeClusterReportResult.controls)
        const failedControls = getFailedControlsById(controls, this.props.object.getId())

        const columns = ['ID', 'Control Name', 'Description'];
        const sortByDefault = { sortBy: sortBy.id, orderBy: "desc" }
        return (
            failedControls.length > 0 ?
                <div>
                    <DrawerTitle title="Kubescape" />
                    <KubescapeControlTable
                        columns={columns}
                        controls={failedControls}
                        nowrap={false}
                        disableRowClick={true}
                        sortByDefault={sortByDefault} />
                </div>
                : null
        )
    }
}
