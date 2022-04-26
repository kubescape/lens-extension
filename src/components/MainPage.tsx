import React from "react";

import { Renderer } from "@k8slens/extensions";
import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react"
import { IpcRenderer } from '../ipc/renderer';
import { Logger } from "../utils/logger";
import "./MainPage.scss";

import { KubescapeIcon } from "./KubescapeIcon";

export function KubescapeMainIcon(props: Renderer.Component.IconProps) {
    return <Renderer.Component.Icon><KubescapeIcon fill="currentColor" size="16" /></Renderer.Component.Icon>
}

@observer
export class KubescapeMainPage extends React.Component {
    constructor(props) {
        super(props);
        makeObservable(this);
    }

    @observable config = {
        version: "",
        directory: "",
        path: "",
        frameworks: [""]
    }

    async componentDidMount() {
        try {
            const ipcInstance = IpcRenderer.getInstance()
            Logger.debug('Got IPC')
            const res = await ipcInstance.invoke('data')
            Logger.debug('Got the api instance')
            this.config = res;
        } catch (err) {
            Logger.error(err)
        }
    }

    configInfo = () => {
        return (
            <>
                <p>Version: <i>{this.config.version}</i></p>
                <p>Base directory: <i>{this.config.directory}</i></p>
                <p>Full Path: <i>{this.config.path}</i></p>
                <p>Frameworks: <i>{this.config.frameworks.join(', ')}</i></p>
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
                <div>TODO</div>
            </Renderer.Component.TabLayout>
        )
    }
}
