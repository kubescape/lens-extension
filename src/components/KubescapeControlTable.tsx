import React from "react";
import { makeObservable, observable, computed } from "mobx";
import { observer } from "mobx-react"
import { Renderer } from "@k8slens/extensions";
import { KubescapeReportStore, KubescapePreferenceStore } from "../stores";
import { KubescapeControl } from "../stores";
import { KubescapeControlDetails } from "./KubescapeControlDetails";
import { docsUrl, prevDefault } from "../utils";

import "./KubescapeControlTable.scss";

const { Component: { TableHead, TableRow, TableCell, Table, Spinner, Badge }, } = Renderer;

enum sortBy {
    id = "id",
    name = "name",
    failedResources = "failedResources",
    allResources = "allResources",
    riskScore = "riskScore",
    severity = "severity"
}

@observer
export class KubescapeControlTable extends React.Component<{search?: string}> {
    constructor(props) {
        super(props);
        makeObservable(this);
    }
    
    @observable selectedControl = null;
    
    @computed get store() { return KubescapeReportStore.getInstance() }

    @computed get statusString() {
        if (!KubescapePreferenceStore.getInstance().isInstalled) {
            return "Initializing Extension...";
        }
        return "Cluster scan in progress"
    }

    onRowClick = (item: KubescapeControl) => {

        if (item.id == this.selectedControl?.id) {
            this.selectedControl = null;
        } else {
            this.selectedControl = item;
        }
    }

    getTableRow = (control: KubescapeControl) => {
        return (
            <TableRow
                onClick={prevDefault(() => this.onRowClick(control))}
                key={control.id}
                sortItem={control}
                nowrap>
                <TableCell className="severity"><Badge style={{backgroundColor : control.severity.color, color:"white", width:70, textAlign:"center"}} label={control.severity.name}/></TableCell>
                <TableCell className="controlId"><a target="_blank" href={docsUrl(control)}>{control.id}</a></TableCell>
                <TableCell className="controlName">{control.name} </TableCell>
                <TableCell className="failedResources">{control.failedResources}</TableCell>
                <TableCell className="allResources">{control.allResources}</TableCell>
                <TableCell className="riskScore">{Math.round(control.riskScore)}%</TableCell>
            </TableRow>
        );
    };

    private sortingCallbacks = {
        [sortBy.id]: (control: KubescapeControl) => control.id,
        [sortBy.name]: (control: KubescapeControl) => control.name,
        [sortBy.failedResources]: (control: KubescapeControl) => control.failedResources,
        [sortBy.allResources]: (control: KubescapeControl) => control.allResources,
        [sortBy.riskScore]: (control: KubescapeControl) => control.riskScore,
        [sortBy.severity]: (control: KubescapeControl) => control.severity.value,
    };

    private getControlString = (control: KubescapeControl): string => {
        return `${control.id}${control.name}`.toLowerCase();
    }

    render() {
        if (!this.store.isScanReady) {
            return (
                <div className="KubescapeControlTable flex center">
                    <div className="progressStatus">
                        <Spinner />
                        <span>{this.statusString}</span>
                    </div>
                </div>
            )
        }
        const { search } = this.props;
        const query = search.toLowerCase();
        const filteredItems = this.store.kubescapeControls.filter((item) => (this.getControlString(item).includes(query)));

        return (
            <>
                <KubescapeControlDetails
                    control={this.selectedControl}
                    onClose={() => { this.selectedControl = null }}
                ></KubescapeControlDetails>
                <Table
                    tableId="controlReportsTable"
                    selectable={true}
                    sortable={this.sortingCallbacks}
                    sortByDefault={{ sortBy: sortBy.failedResources, orderBy: "desc" }}
                    renderRow={this.getTableRow}
                    items={filteredItems}
                >
                    <TableHead sticky={true}>
                        <TableCell className="severity" sortBy={sortBy.severity}>Severity</TableCell>
                        <TableCell className="controlId" sortBy={sortBy.id}>ID</TableCell>
                        <TableCell className="controlName" sortBy={sortBy.name}>Control Name</TableCell>
                        <TableCell className="failedResources" sortBy={sortBy.failedResources}>Failed Resources</TableCell>
                        <TableCell className="allResources" sortBy={sortBy.allResources}>All Resources</TableCell>
                        <TableCell className="riskScore" sortBy={sortBy.riskScore}>Risk Score</TableCell>
                    </TableHead>
                </Table>
            </>
        )
    }
}
