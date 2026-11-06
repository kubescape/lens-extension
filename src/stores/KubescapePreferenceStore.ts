import { Common } from "@k8slens/extensions";
import { IKubescapeConfig } from "@kubescape/install";
import { observable, makeObservable } from "mobx";
const { Store } = Common;

export type KubescapePreferenceStoreModel = {
    kubescapeConfig: IKubescapeConfig;
    isInstalled: boolean;
    excludedNamespaces: string[];
}

export class KubescapePreferenceStore extends Store.ExtensionStore<KubescapePreferenceStoreModel>{
    @observable kubescapeConfig: IKubescapeConfig = null;
    @observable isInstalled = false;
    @observable excludedNamespaces: string[] = [];

    constructor() {
      super({
        configName: "kubescape-preference-store",
        defaults: {
          isInstalled: false,
          kubescapeConfig: null,
          excludedNamespaces: [],
        }
      });
      makeObservable(this);
    }

    protected fromStore({ kubescapeConfig, isInstalled, excludedNamespaces = [] }: KubescapePreferenceStoreModel): void {
      this.kubescapeConfig = kubescapeConfig;
      this.isInstalled = isInstalled;
      this.excludedNamespaces = excludedNamespaces;
    }

    toJSON(): KubescapePreferenceStoreModel {
      return {
        kubescapeConfig: this.kubescapeConfig,
        isInstalled: this.isInstalled,
        excludedNamespaces: [...this.excludedNamespaces]
      };
    }
}
