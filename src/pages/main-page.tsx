import { Renderer } from "@k8slens/extensions";
import { CoffeeDoodle } from "react-open-doodles";
import path from "path";
import React from "react"

import { IpcRenderer } from '../ipc/renderer'
import { Logger } from "../utils/logger";

export function KubescapeMainIcon(props: Renderer.Component.IconProps) {
  return <Renderer.Component.Icon {...props} material="pages" tooltip={path.basename(__filename)}/>
}

export class KubescapeMainPage extends React.Component<{ extension: Renderer.LensExtension }> {
    state = { data : {
        version : "",
        directory : "",
        path : "",
        frameworks : [""]
    } }

    async componentDidMount() {
        try {
            const ipcInstance = IpcRenderer.getInstance()
            Logger.debug('Got IPC')
            const res = await ipcInstance.invoke('data')
            Logger.debug('Got the api instance')
            this.setState({ data : res });
        } catch(err) {
            Logger.error(err)
        }
    }
    
    render() {
        const doodleStyle = {
            width: "200px"
        }
        return (
            <div className="flex column gaps align-flex-start">
                <div style={doodleStyle}><CoffeeDoodle accent="#3d90ce" /></div>
                <h1>Kubescape</h1>
                <p>Kubescape version: <i>{this.state.data.version}</i></p>
                <p>Kubescape base directory: <i>{this.state.data.directory}</i></p>
                <p>Kubescape fullpath: <i>{this.state.data.path}</i></p>

                <p>Kubescape frameworks:
                    <ul>
                        {this.state.data.frameworks.map(f=> <li><i>{f}</i></li>)}
                    </ul>
                </p>
                
            </div>
        )
    }
}
