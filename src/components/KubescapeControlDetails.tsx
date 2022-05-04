import React from "react";

import { Renderer } from "@k8slens/extensions";
import { observable, makeObservable, computed, reaction, runInAction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react"
import { KubescapeControl } from "../kubescape/types";
import { docsUrl, getRelatedObjectsFromControl } from "../kubescape/controlUtils";
import { KubescapeControlSeverity } from "./KubescapeControlSeverity";
import { KubescapeReportStore } from "../stores";

const { Component: { Drawer, DrawerItem, DrawerTitle, Icon, Table, TableHead, TableCell, TableRow } } = Renderer;

@observer
export class KubescapeControlDetails extends React.Component<{ control?: KubescapeControl, onClose?: () => void }> {
    constructor(props) {
        super(props);
        makeObservable(this);
    }

    @observable failedResources = null;

    @computed get control() {
        return this.props.control;
    }

    @computed get store() {
        return KubescapeReportStore.getInstance();
    }

    async componentDidMount() {
        disposeOnUnmount(this, [
            reaction(() => this.control,
                async () => {
                    const result = await this.resolveFailedResources();
                    runInAction(() => {
                        this.failedResources = result;
                    })
                }
            )]
        );
    }

    resolveFailedResources = async () => {
        if (!this.control) {
            return null;
        }

        const relatedObjects = getRelatedObjectsFromControl(this.control.rawResult)
        return await Promise.all(relatedObjects.map(async (entity) => {
            const kubeObject = await this.store.getKubeObject(entity.kind, entity.apiVersion, entity.metadata.uid)
            if (!kubeObject) {
                console.error(`Couldnt find KubeObject '${entity.metadata.uid}' of kind ${entity.kind}`);
                return null;
            }

            return {
                id: entity.metadata.uid,
                name: kubeObject.getName(),
                kind: kubeObject.kind,
                namespace: kubeObject.metadata.namespace,
                detailsUrl: Renderer.Navigation.getDetailsUrl(kubeObject.selfLink)
            };
        }));
    }


    @computed get title() {
        return this.control ? `${this.control.id} - ${this.control.name}` : null;
    }

    @computed get controlDetails() {
        if (!this.control) {
            return null;
        }

        return (<>
            <DrawerTitle>{this.control.name}</DrawerTitle>
            <DrawerItem name="Description">{this.control.description}</DrawerItem>
            <DrawerItem name="Severity"><KubescapeControlSeverity control={this.control} /></DrawerItem>
            <DrawerItem name="Remediation">{this.control.remediation}</DrawerItem>
            <DrawerItem name="More Information">
                <a target="_blank" href={docsUrl(this.control)}><Icon material="open_in_browser"></Icon></a>
            </DrawerItem>
        </>);
    }

    @computed get failedResourcesTable() {
        if (!this.failedResources || this.failedResources.length == 0) {
            return null;
        }

        const columns = [
            { title: 'Namespace', value: (kubeObject) => kubeObject.namespace },
            { title: 'Kind', value: (kubeObject) => kubeObject.kind },
            { title: 'Name', value: (kubeObject) => <a href="#" onClick={() => Renderer.Navigation.navigate(kubeObject.detailsUrl)}>{kubeObject.name}</a> },
        ]

        return (<><DrawerTitle>Failed Resources</DrawerTitle>
            <Table>
                <TableHead>
                    {columns.map(col => <TableCell>{col.title}</TableCell>)}
                </TableHead>
                {this.failedResources.map(kubeObject =>
                    <TableRow key={kubeObject.id}>
                        {columns.map(col => <TableCell>{col.value(kubeObject)}</TableCell>)}
                    </TableRow>
                )}
            </Table>

        </>);
    }

    render() {
        const { onClose } = this.props;

        return (
            <Drawer
                className="KubeObjectDetails flex column"
                open={this.control != null}
                title={this.title}
                toolbar={null}
                onClose={onClose}
            >
                {this.controlDetails}
                {this.failedResourcesTable}
            </Drawer>
        );
    }
}