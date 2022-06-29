import { Common } from "@k8slens/extensions";
import { IKubescapeConfig } from "@kubescape/install";
import { observable, makeObservable } from "mobx";
const { Store } = Common;

export type KubescapePreferenceStoreModel = {
    kubescapeConfig: IKubescapeConfig;
    isInstalled: boolean;
}

export class KubescapePreferenceStore extends Store.ExtensionStore<KubescapePreferenceStoreModel>{
    @observable kubescapeConfig: IKubescapeConfig = null;
    @observable isInstalled = false;

    constructor() {
      super({
        configName: "kubescape-preference-store",
        defaults: {
          isInstalled: false,
          kubescapeConfig: null,
        }
      });
      makeObservable(this);
    }

    protected fromStore({ kubescapeConfig, isInstalled }: KubescapePreferenceStoreModel): void {
      this.kubescapeConfig = kubescapeConfig;
      this.isInstalled = isInstalled;
    }

    toJSON(): KubescapePreferenceStoreModel {
      return {
        kubescapeConfig: this.kubescapeConfig,
        isInstalled: this.isInstalled
      };
    }
}