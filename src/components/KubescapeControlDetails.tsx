import React from "react";

import { Renderer } from "@k8slens/extensions";
import { makeObservable } from "mobx";
import { observer } from "mobx-react"
import { KubescapeControl } from "../stores";

const { Component: { Drawer, DrawerItem, DrawerTitle,Icon } } = Renderer;


@observer
export class KubescapeControlDetails extends React.Component<{ control?: KubescapeControl, onClose?: () => void }> {
    constructor(props) {
        super(props);
        makeObservable(this);
    }

    render() {
        const { control, onClose } = this.props;
        const docUrl = control ? `https://hub.armo.cloud/docs/${control.id.toLocaleLowerCase()}` : null;

        return (
            <Drawer
                className="KubeObjectDetails flex column"
                open={control != null}
                title={control ? `${control.id} - ${control.name}` : ''}
                toolbar={null}
                onClose={onClose}
            >
                <DrawerTitle>{control?.name ?? ''}</DrawerTitle>
                <DrawerItem name="Description">{control?.description ?? ''}</DrawerItem>
                <DrawerItem name="Remediation">{control?.remediation ?? ''}</DrawerItem>
                <DrawerItem name="More Information">
                    <a target="_blank" href={docUrl}><Icon material="open_in_browser"></Icon></a>
                </DrawerItem>
            </Drawer>
        );
    }
}