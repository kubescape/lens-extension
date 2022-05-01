import React from "react";

import { Renderer } from "@k8slens/extensions";
import { observable, computed, makeObservable } from "mobx";
import { observer } from "mobx-react"
import { KubescapeControlTable, KubescapeIcon } from ".";
import { KubescapePreferenceStore, KubescapeReportStore } from "../stores";

const { Component: { Button, Icon, TabLayout, SearchInput } } = Renderer;

import "./ClusterPage.scss";

export function ClusterPageIcon(props: Renderer.Component.IconProps) {
    return <Renderer.Component.Icon><KubescapeIcon fill="currentColor" size="16" {...props} /></Renderer.Component.Icon>
}

@observer
export class ClusterPage extends React.Component {
    constructor(props) {
        super(props);
        makeObservable(this);
    }

    @observable controlTableSearch = "";

    @computed get isInstalled() { return KubescapePreferenceStore.getInstance().isInstalled; }
    @computed get config() { return KubescapePreferenceStore.getInstance().kubescapeConfig; }
    @computed get store() { return KubescapeReportStore.getInstance(); }

    @computed get scanTime() {
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' } as const;
        return (new Date(this.store.activeClusterReportResult.time)).toLocaleTimeString('en-US', options);
    }

    configInfo = () => {
        if (!this.isInstalled) {
            return <div className="KubescapeControlTable flex center">
                <Renderer.Component.Spinner />
                <span>Initializing</span>
            </div>
        }

        return (
            <>
                <p>Version: <i>{this.config.version}</i></p>
                <p>Base directory: <i>{this.config.baseDirectory}</i></p>
            </>
        );
    }

    render() {
        return (
            <TabLayout className="ClusterPage">
                <header className="flex gaps align-center">
                    <h2 className="flex gaps align-center">
                        <KubescapeIcon size={50} />
                        <span>Kubescape</span>
                        <Icon material="info" tooltip={this.configInfo()} />
                    </h2>
                    <div className="controls">
                        {this.store.isScanReady ?
                            <SearchInput
                                value={this.controlTableSearch}
                                theme="round-black"
                                onChange={(value) => { this.controlTableSearch = value }}>
                                <Icon material="search" />
                            </SearchInput>
                            : null
                        }
                        <Button
                            label='Scan'
                            onClick={this.store.scanCluster}
                            primary
                            waiting={!this.store.isScanReady}
                            disabled={!this.store.isScanReady}
                            hidden={!this.isInstalled}
                        />
                        {this.store.isScanReady ?
                            <div><i><div>Last scan: </div><div>{this.scanTime}</div></i></div>
                            : null
                        }
                    </div>
                </header>
                <KubescapeControlTable search={this.controlTableSearch} />
            </TabLayout>
        );
    }
}