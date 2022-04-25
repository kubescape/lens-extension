import { Main } from "@k8slens/extensions";

import { KubescapeApi } from '@kubescape/install'
import { Logger } from "../utils/logger";

export class IpcMain extends Main.Ipc {
    constructor(extension: Main.LensExtension) {
        super(extension);

        this.listen("initialize", onInitialize);
        this.handle('data', handleDataRequest)
    }
}


function onInitialize(arg0: string, id: string) {
    Logger.debug(`starting to initialize: ${arg0} ${id}`);
}

function handleDataRequest(event: string, handleDataRequest: any) {
    Logger.debug(`I just received ${event} and kubescape is version ${KubescapeApi.instance.version}`)
    return {
        version : KubescapeApi.instance.version,
        directory : KubescapeApi.instance.directory,
        path : KubescapeApi.instance.path,
        frameworks : KubescapeApi.instance.frameworksNames
    }
}

