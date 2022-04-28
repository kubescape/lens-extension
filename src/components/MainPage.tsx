import React from "react";

import { Renderer } from "@k8slens/extensions";
import { computed, makeObservable } from "mobx";
import { observer } from "mobx-react"
import { NamespacePage, KubescapeIcon } from ".";
import { KubescapePreferenceStore } from "../stores/KubescapePreferenceStore";

import "./MainPage.scss";

export function KubescapeMainIcon(props: Renderer.Component.IconProps) {
    return <Renderer.Component.Icon><KubescapeIcon fill="currentColor" size="16" /></Renderer.Component.Icon>
}

@observer
export class KubescapeMainPage extends React.Component {
    constructor(props) {
        super(props);
        makeObservable(this);
    }

    @computed get isInstalled() { return KubescapePreferenceStore.getInstance().isInstalled };
    @computed get config() { return KubescapePreferenceStore.getInstance().kubescapeConfig };

    configInfo = () => {
        if (!this.isInstalled) {
            return <div className="NamespacePage flex center">
                <Renderer.Component.Spinner />
                <span>Initializing</span>
            </div>
        }

        return (
            <>
                <p>Version: <i>{this.config.version}</i></p>
                <p>Base directory: <i>{this.config.baseDirectory}</i></p>
                <p>Frameworks: <i>{this.config.requiredFrameworks.join(', ')}</i></p>
            </>
        );
    };

    render() {
        return (
            <Renderer.Component.TabLayout className="KubescapeMainPage">
                <header className="flex gaps align-center">
                    <h2 className="flex gaps align-center">
                        <KubescapeIcon size={50} />
                        <span>Kubescape</span>
                        <Renderer.Component.Icon material="info" tooltip={this.configInfo()} />
                    </h2>
                    <div className="box right">
                        <Renderer.Component.NamespaceSelectFilter />
                    </div>
                </header>
                <NamespacePage />
            </Renderer.Component.TabLayout>
        )
    }
}
