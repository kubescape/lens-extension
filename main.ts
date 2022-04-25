import { Main } from "@k8slens/extensions";

import * as path from 'path'

import { Logger } from './src/utils/logger'
import { KubescapeApi, IKubescapeConfig } from '@kubescape/install'
import { LensUI } from "./src/kubescape/ui";

import { IpcMain } from './src/ipc/main'


export default class KubescapeExtensionMain extends Main.LensExtension {
    async onActivate() {
        Logger.debug('Kubescape main activated');
        IpcMain.createInstance(this)

        const extensionDirectory = await this.getExtensionFileFolder()

        const kubescapeBinDir = path.join(extensionDirectory, "bin")

        const kubescapeApi = KubescapeApi.instance

        const kubescapeOK = await kubescapeApi.setup(new LensUI, new class implements IKubescapeConfig {
            get version(): string {
                return "latest"
            }
            get frameworksDirectory(): string {
                return kubescapeBinDir
            }
            get baseDirectory(): string {
                return kubescapeBinDir
            }
            get requiredFrameworks(): string[] {
                return [ "nsa", "mitre" ]
            }
            get scanFrameworks(): string[] {
                return [ "nsa", "mitre" ]
            }
        })

        if (kubescapeOK)
        {
            Logger.info(`Kubescape installed successfully in ${kubescapeBinDir}`)
        }
        else
        {
            /* Deactivate extension here */
            Logger.info("Kubescape is not installed properly")
            this.disable();
        }
    }

    onDeactivate() {
        Logger.debug('Kubescape main de-activated');
    }
}
