import React from "react";

import { Renderer } from "@k8slens/extensions";
import { makeObservable } from "mobx";
import { observer } from "mobx-react"
import { KubescapeControl } from "../stores";
import { docsUrl } from "../utils";

const { Component: { Drawer, DrawerItem, DrawerTitle, Icon } } = Renderer;


@observer
export class KubescapeControlDetails extends React.Component<{ control?: KubescapeControl, onClose?: () => void }> {
    constructor(props) {
        super(props);
        makeObservable(this);
    }

    render() {
        const { control, onClose } = this.props;

        let title = '';
        const items = [];

        if (control) {
            title = `${control.id} - ${control.name}`;
            items.push(<DrawerTitle>{control.name}</DrawerTitle>);
            items.push(<DrawerItem name="Description">{control.description}</DrawerItem>);
            items.push(<DrawerItem name="Remediation">{control.remediation}</DrawerItem>);
            items.push(<DrawerItem name="More Information">
                <a target="_blank" href={docsUrl(control)}><Icon material="open_in_browser"></Icon></a>
            </DrawerItem>);
        }
        return (
            <Drawer
                className="KubeObjectDetails flex column"
                open={control != null}
                title={title}
                toolbar={null}
                onClose={onClose}
            >
                {items}
            </Drawer>
        );
    }
}