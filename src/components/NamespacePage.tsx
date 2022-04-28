import React from "react";

import { Renderer, Common } from "@k8slens/extensions";
import { comparer, makeObservable, observable, reaction, computed } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react"
import { KubescapePreferenceStore } from "../stores/KubescapePreferenceStore";
import { KubescapeReportStore } from "../stores/KubescapeReportStore";

import "./NamespacePage.scss";
import { Logger } from "../utils/logger";

const { Component: { TableHead, TableRow, TableCell, Table, Spinner, Icon } } = Renderer;
type Pod = Renderer.K8sApi.Pod;


@observer
export class NamespacePage extends React.Component {
    namespaceStore: Renderer.K8sApi.NamespaceStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.namespacesApi) as Renderer.K8sApi.NamespaceStore;
    podsStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.podsApi) as Renderer.K8sApi.PodsStore;

    constructor(props) {
        super(props);
        makeObservable(this);
    }

    async componentDidMount() {
        const reactionOpts = {
            equals: comparer.structural,
        }

        disposeOnUnmount(this, [
            reaction(() => this.namespaceStore.selectedNames, this.namespaceChanged, reactionOpts),
        ]);
    }

    @observable isScanRunning = false;

    @computed get activeClusterResult() {
        if (!this.activeClusterId) {
            return null;
        }
        const reportStore = KubescapeReportStore.getInstance();
        const scan = reportStore.scanResults.find(result => result.clusterId == this.activeClusterId);
        return scan;
    }

    @computed get selectedNamespaces() {
        return [...this.namespaceStore.selectedNames];
    }

    @computed get isInstalled() { return KubescapePreferenceStore.getInstance().isInstalled };

    @computed get podList() {
        let pods = []
        this.selectedNamespaces.map(ns => {
            pods.push(...this.podsStore.getAllByNs(ns).map((pod: Pod) => pod.getName()))
        });
        return pods;

    }

    namespaceChanged = () => {
        console.log(this.namespaceStore.selectedNames);
    }

    @computed get activeClusterName() {
        return this.activeCluster?.getName() ?? null;
    }

    @computed get activeClusterId() {
        return this.activeCluster?.getId() ?? null;
    }

    @computed get activeCluster() {
        const activeEntity = Renderer.Catalog.catalogEntities.activeEntity;
        if (activeEntity && activeEntity instanceof Common.Catalog.KubernetesCluster) {
            return activeEntity;
        }
        return null;
    }

    @computed get statusString() {
        if (!this.isInstalled) {
            return "Initializing Extension...";
        }
        return "Cluster scan in progress"
    }

    @computed get tableRows() {
        const controls = [];

        for (let control of this.activeClusterResult.result) {
            const docUrl = `https://hub.armo.cloud/docs/${control.controlID.toLocaleLowerCase()}`
            controls.push(
                <TableRow key={control.controlID} nowrap>
                    <TableCell className="controlId"><a target="_blank" href={docUrl}>{control.controlID}</a></TableCell>
                    <TableCell className="controlName">{control.name} </TableCell>
                    {/* <TableCell className="controlDescription">{control.description}</TableCell> */}
                    <TableCell className="failedResources">{control.failedResources}</TableCell>
                    {/* <TableCell className="excludedResources">{control.warningResources}</TableCell> */}
                    <TableCell className="allResources">{control.totalResources}</TableCell>
                    <TableCell className="riskScore">{control.score}%</TableCell>
                </TableRow>
            )

        }

        return controls;
    }

    render() {
        Logger.debug(this.activeClusterResult.result);

        if (!this.activeClusterResult || !this.activeClusterResult.result) {
            return (
                <div className="NamespacePage flex center">
                    <div className="progressStatus">
                        <Spinner />
                        <span>{this.statusString}</span>
                    </div>
                </div>
            )
        }

        return (
            <>
                <Table tableId="controlReportsTable" selectable >
                    <TableHead>
                        <TableCell className="controlId">ID</TableCell>
                        <TableCell className="controlName">Control Name</TableCell>
                        {/* <TableCell className="controlDescription">Description</TableCell> */}
                        <TableCell className="failedResources">Failed Resources</TableCell>
                        {/* <TableCell className="excludedResources">Excluded Resources</TableCell> */}
                        <TableCell className="allResources">All Resources</TableCell>
                        <TableCell className="riskScore">Risk Score</TableCell>
                    </TableHead>
                    {this.tableRows}
                </Table>
            </>
        )
    }
}
