import React from "react";
import { makeObservable, observable, computed } from "mobx";
import { observer } from "mobx-react"
import { Renderer } from "@k8slens/extensions";
import { KubescapeReportStore, KubescapePreferenceStore } from "../stores";
import { KubescapeControl } from "../kubescape/types";
import { KubescapeControlDetails, KubescapeControlSeverity, KubescapeControlStatus } from ".";
import { docsUrl } from "../kubescape/controlUtils";
import { prevDefault } from "../utils";

import "./KubescapeControlTable.scss";

const { Component: { TableHead, TableRow, TableCell, Table, Spinner }, } = Renderer;

export enum controlTableColumn {
    id = "id",
    name = "name",
    failedResources = "failedResources",
    allResources = "allResources",
    riskScore = "riskScore",
    severity = "severity",
    description = "description",
    status = "status"
}

@observer
export class KubescapeControlTable extends React.Component<{
    search?: string,
    columns?: string[],
    controls?: KubescapeControl[],
    nowrap?: boolean,
    sortByDefault: any,
    disableRowClick?: boolean
}> {
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

    get columns() {
        const allColumns = [
            {
                id: controlTableColumn.status,
                title: 'Status',
                className: 'status',
                value: (control: KubescapeControl) => <KubescapeControlStatus control={control} />

            },
            {
                id: controlTableColumn.severity,
                title: 'Severity',
                className: 'severity',
                value: (control: KubescapeControl) => <KubescapeControlSeverity isDisabled={control.failedResources === 0} control={control} />

            },
            {
                id: controlTableColumn.id,
                title: 'ID',
                className: 'controlId',
                value: (control: KubescapeControl) => <a target="_blank" href={docsUrl(control)}>{control.id}</a>
            },
            {
                id: controlTableColumn.name,
                title: 'Control Name',
                className: 'controlName',
                value: (control: KubescapeControl) => control.name
            },
            {
                id: controlTableColumn.description,
                title: 'Description',
                className: 'controlDescription',
                value: (control: KubescapeControl) => control.description
            },
            {
                id: controlTableColumn.failedResources,
                title: 'Failed Resources',
                className: 'failedResources',
                value: (control: KubescapeControl) => control.failedResources
            },
            {
                id: controlTableColumn.allResources,
                title: 'All Resources',
                className: 'allResources',
                value: (control) => control.allResources
            },
            {
                id: controlTableColumn.riskScore,
                title: 'Risk Score',
                className: 'riskScore',
                value: (control: KubescapeControl) => `${Math.round(control.riskScore)}%`
            }
        ]

        if (this.props.columns) {
            return allColumns.filter(col => this.props.columns.includes(col.id));
        }

        return allColumns;
    }

    @computed get getTableHeader() {
        return (
            <TableHead sticky={true}>
                {this.columns.map(col => <TableCell key={col.title} className={col.className} sortBy={col.id}>{col.title}</TableCell>)}
            </TableHead>);
    }

    getTableRow = (control: KubescapeControl) => {
        let rowClick = prevDefault(() => this.onRowClick(control))
        if (this.props.disableRowClick) {
            rowClick = () => null;
        }

        return (
            <TableRow
                onClick={rowClick}
                key={control.id}
                sortItem={control}
                nowrap={this.props.nowrap ?? true}>
                {this.columns.map(col =>
                    <TableCell className={col.className}>{col.value(control)}</TableCell>
                )}
            </TableRow>
        );
    };

    private sortingCallbacks = {
        [controlTableColumn.id]: (control: KubescapeControl) => control.id,
        [controlTableColumn.name]: (control: KubescapeControl) => control.name,
        [controlTableColumn.failedResources]: (control: KubescapeControl) => control.failedResources,
        [controlTableColumn.allResources]: (control: KubescapeControl) => control.allResources,
        [controlTableColumn.riskScore]: (control: KubescapeControl) => control.riskScore,
        [controlTableColumn.severity]: (control: KubescapeControl) => control.severity.value,
        [controlTableColumn.description]: (control: KubescapeControl) => control.description,
        [controlTableColumn.status]: (control: KubescapeControl) => control.status.value * control.severity.value,
    };

    private getControlString = (control: KubescapeControl): string => {
        return `${control.severity.name}${control.id}${control.name}`.toLowerCase();
    }

    @computed get tableItems() {
        let items = this.props.controls ? this.props.controls : this.store.kubescapeControls;

        if (this.props.search) {
            const query = this.props.search.toLowerCase();
            items = items.filter((item) => (this.getControlString(item).includes(query)))
        }

        return items;
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
        const { sortByDefault, disableRowClick } = this.props;

        return (
            <>
                <KubescapeControlDetails
                    control={this.selectedControl}
                    onClose={() => { this.selectedControl = null }}
                ></KubescapeControlDetails>
                <Table
                    tableId="controlReportsTable"
                    selectable={disableRowClick ? false : true}
                    sortable={this.sortingCallbacks}
                    sortByDefault={sortByDefault}
                    renderRow={this.getTableRow}
                    items={this.tableItems}
                >
                    {this.getTableHeader}
                </Table>
            </>
        )
    }
}
