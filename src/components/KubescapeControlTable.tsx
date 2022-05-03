import React from "react";
import { makeObservable, observable, computed } from "mobx";
import { observer } from "mobx-react"
import { Renderer } from "@k8slens/extensions";
import { KubescapeReportStore, KubescapePreferenceStore } from "../stores";
import { KubescapeControl } from "../kubescape/types";
import { KubescapeControlDetails, KubescapeControlSeverity } from ".";
import { docsUrl } from "../kubescape/controlUtils";
import { prevDefault } from "../utils";

import "./KubescapeControlTable.scss";

const { Component: { TableHead, TableRow, TableCell, Table, Spinner, Badge }, } = Renderer;

export enum sortBy {
    id = "id",
    name = "name",
    failedResources = "failedResources",
    allResources = "allResources",
    riskScore = "riskScore",
    severity = "severity",
    description = "description"
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
                title: 'Severity',
                sortBy: sortBy.severity,
                className: 'severity',
                value: (control: KubescapeControl) => <KubescapeControlSeverity control={control} />

            },
            {
                title: 'ID',
                sortBy: sortBy.id,
                className: 'controlId',
                value: (control: KubescapeControl) => <a target="_blank" href={docsUrl(control)}>{control.id}</a>
            },
            {
                title: 'Control Name',
                sortBy: sortBy.name,
                className: 'controlName',
                value: (control: KubescapeControl) => control.name
            },
            {
                title: 'Description',
                sortBy: sortBy.description,
                className: 'controlDescription',
                value: (control: KubescapeControl) => control.description
            },
            {
                title: 'Failed Resources',
                sortBy: sortBy.failedResources,
                className: 'failedResources',
                value: (control: KubescapeControl) => control.failedResources
            },
            {
                title: 'All Resources',
                sortBy: sortBy.allResources,
                className: 'allResources',
                value: (control) => control.allResources
            },
            {
                title: 'Risk Score',
                sortBy: sortBy.riskScore,
                className: 'riskScore',
                value: (control: KubescapeControl) => `${Math.round(control.riskScore)}%`
            }
        ]

        if (this.props.columns) {
            return allColumns.filter(col => this.props.columns.includes(col.title));
        }

        return allColumns;
    }

    getTableHeader = () => {
        return (
            <TableHead sticky={true}>
                {this.columns.map(col => <TableCell key={col.title} className={col.className} sortBy={col.sortBy}>{col.title}</TableCell>)}
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
        [sortBy.id]: (control: KubescapeControl) => control.id,
        [sortBy.name]: (control: KubescapeControl) => control.name,
        [sortBy.failedResources]: (control: KubescapeControl) => control.failedResources,
        [sortBy.allResources]: (control: KubescapeControl) => control.allResources,
        [sortBy.riskScore]: (control: KubescapeControl) => control.riskScore,
        [sortBy.severity]: (control: KubescapeControl) => control.severity.value,
        [sortBy.description]: (control: KubescapeControl) => control.description
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
        const { search, controls, sortByDefault, disableRowClick } = this.props;

        let items = controls ? controls : this.store.kubescapeControls;

        if (search) {
            const query = search?.toLowerCase();
            items = items.filter((item) => (this.getControlString(item).includes(query)))
        }

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
                    items={items}
                >
                    {this.getTableHeader()}
                </Table>
            </>
        )
    }
}
