import { Main } from "@k8slens/extensions";

import * as path from "path"

import { Logger } from "./src/utils/logger"
import { KubescapeApi, IKubescapeConfig } from "@kubescape/install";
import { LensUI } from "./src/kubescape/ui";

import { IpcMain } from "./src/ipc/main"
import { KubescapePreferenceStore } from "./src/stores/KubescapePreferenceStore";
import { KubescapeReportStore } from "./src/stores/KubescapeReportStore";
import { DEFAULT_KUBESCAPE_FRAMEWORKS, DEFAULT_KUBESCAPE_VERSION } from "./src/utils/consts";

export default class KubescapeExtensionMain extends Main.LensExtension {
  async onActivate() {
    Logger.debug("Kubescape main activated");
    IpcMain.createInstance(this)
    const preferenceStore = KubescapePreferenceStore.createInstance();
    preferenceStore.loadExtension(this);
    KubescapeReportStore.createInstance().loadExtension(this);

    const extensionDirectory = await this.getExtensionFileFolder()
    const kubescapeBinDir = path.join(extensionDirectory, "bin")
    const kubescapeApi = KubescapeApi.instance

    const defaultConfig: IKubescapeConfig = {
      version: DEFAULT_KUBESCAPE_VERSION,
      frameworksDirectory: kubescapeBinDir,
      baseDirectory: kubescapeBinDir,
      requiredFrameworks: DEFAULT_KUBESCAPE_FRAMEWORKS,
      scanFrameworks: DEFAULT_KUBESCAPE_FRAMEWORKS
    }

    if (!preferenceStore.kubescapeConfig) {
      preferenceStore.kubescapeConfig = defaultConfig;
    }
    if (preferenceStore.kubescapeConfig.version != DEFAULT_KUBESCAPE_VERSION) {
      Logger.info(`Kubescape existing version (${preferenceStore.kubescapeConfig.version})is different than the default (${DEFAULT_KUBESCAPE_VERSION}). Upgrading.`)
      preferenceStore.kubescapeConfig.version = DEFAULT_KUBESCAPE_VERSION
    }
    
    const kubescapeOK = await kubescapeApi.setup(new LensUI, preferenceStore.kubescapeConfig)

    if (kubescapeOK) {
      Logger.info("Updating preference store");
      preferenceStore.isInstalled = kubescapeApi.isInstalled;
      preferenceStore.kubescapeConfig = {
        version: kubescapeApi.version,
        baseDirectory: kubescapeBinDir,
        scanFrameworks: kubescapeApi.frameworksNames,
        frameworksDirectory: kubescapeApi.frameworkDirectory,
        requiredFrameworks: []
      }
      Logger.info(`Kubescape installed successfully in ${kubescapeBinDir}`)
    }
    else {
      /* Deactivate extension here */
      Logger.info("Kubescape is not installed properly")
      this.disable();
    }
  }

  onDeactivate() {
    Logger.debug("Kubescape main de-activated");
  }
}
