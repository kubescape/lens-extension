import React from "react";

import { Renderer, Common } from "@k8slens/extensions";
import { comparer, makeObservable, observable, reaction, computed } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react"
import { KubescapePreferenceStore } from "../stores/KubescapePreferenceStore";
import { KubescapeReportStore } from "../stores/KubescapeReportStore";

import "./NamespacePage.scss";

const { Component } = Renderer;
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

    render() {
        if (!this.activeClusterResult || !this.activeClusterResult.result) {
            return (
                <div className="NamespacePage flex center">
                    <div className="progressStatus">
                    <Component.Spinner />
                    <span>{this.statusString}</span>
                    </div>
                </div>
            )
        }

        return (
            <>
                <div>Selected Namespaces: {this.selectedNamespaces.map(ns => (<span>{ns}</span>))}</div>
                <div>Pods: </div>{this.podList.map(pod => (<div>{pod}</div>))}
                <div>Scan Result: {this.activeClusterResult.result}</div>
            </>
        )
    }
}
