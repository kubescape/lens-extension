import React from "react";

import { Renderer } from "@k8slens/extensions";
import { observable, computed, makeObservable, action } from "mobx";
import { observer } from "mobx-react"
import { KubescapeControlTable, KubescapeIcon, controlTableColumn } from ".";
import { KubescapePreferenceStore, KubescapeReportStore } from "../stores";

const { Component: { Button, Icon, TabLayout, SearchInput } } = Renderer;

import "./ClusterPage.scss";
import { IpcRenderer } from "../ipc/renderer";
import { scanClusterTask } from "../kubescape/clusterScan";

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

    @computed get preferenceStore() { return KubescapePreferenceStore.getInstance(); }
    @computed get reportStore() { return KubescapeReportStore.getInstance(); }
    @computed get ipc() { return  IpcRenderer.getInstance(); }

    @computed get isInstalled() { return this.preferenceStore.isInstalled; }
    @computed get config() { return this.preferenceStore.kubescapeConfig; }

    @computed get scanTime() {
      const options = { year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" } as const;
      return (new Date(this.reportStore.activeClusterReportResult.time)).toLocaleTimeString("en-US", options);
    }

    @action scanCluster = async () => {
      const filtered = this.reportStore.scanResults.filter(result => result.clusterId != this.reportStore.activeClusterId);
      this.reportStore.scanResults = filtered;
      await scanClusterTask(this.preferenceStore, this.reportStore, this.ipc);
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
      const columns = [
        controlTableColumn.status,
        controlTableColumn.severity, 
        controlTableColumn.id,
        controlTableColumn.name,
        controlTableColumn.failedResources,
        controlTableColumn.allResources,
        controlTableColumn.riskScore
      ];

      return (
        <TabLayout className="ClusterPage">
          <header className="flex gaps align-center">
            <h2 className="flex gaps align-center">
              <KubescapeIcon size={50} />
              <span>Kubescape</span>
              <Icon material="info" tooltip={this.configInfo()} />
            </h2>
            <div className="controls">
              {this.reportStore.isScanReady ?
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
                onClick={this.scanCluster}
                primary
                waiting={!this.reportStore.isScanReady}
                disabled={!this.reportStore.isScanReady}
                hidden={!this.isInstalled}
              />
              {this.reportStore.isScanReady ?
                <div><i><div>Last scan: </div><div>{this.scanTime}</div></i></div>
                : null
              }
            </div>
          </header>
          <KubescapeControlTable search={this.controlTableSearch} columns={columns} sortByDefault={{ sortBy: controlTableColumn.status, orderBy: "desc" }}/>
        </TabLayout>
      );
    }
}