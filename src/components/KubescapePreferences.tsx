import { Renderer } from "@k8slens/extensions";
import React from "react";
import { KubescapePreferenceStore } from "../stores";
import { observer } from "mobx-react";
import { makeObservable, observable } from "mobx";

const { Component } = Renderer;

type Props = {}

@observer
export class KubescapePreferenceInput extends React.Component<Props> {
  constructor(props: {} | Readonly<{}>) {
    super(props);
    makeObservable(this);
  }

    @observable version = KubescapePreferenceStore.getInstance().kubescapeConfig?.version ?? "";
    @observable frameworksDirectory = KubescapePreferenceStore.getInstance().kubescapeConfig?.frameworksDirectory ?? "";
    @observable baseDirectory = KubescapePreferenceStore.getInstance().kubescapeConfig?.baseDirectory ?? "";
    @observable requiredFrameworks = KubescapePreferenceStore.getInstance().kubescapeConfig?.requiredFrameworks ?? [];
    @observable scanFrameworks = KubescapePreferenceStore.getInstance().kubescapeConfig?.scanFrameworks ?? [];
    @observable isInstalled = KubescapePreferenceStore.getInstance().isInstalled ?? false;

    @observable isSaving = false;

    saveChanges = () => {
      this.isSaving = true;
      KubescapePreferenceStore.getInstance().kubescapeConfig = {
        version: this.version,
        frameworksDirectory: this.frameworksDirectory,
        baseDirectory: this.baseDirectory,
        requiredFrameworks: this.requiredFrameworks,
        scanFrameworks: this.scanFrameworks,
      };
      this.isSaving = false;
    }

    onChange = (value: string, event: React.ChangeEvent<HTMLInputElement>) => {
      this[event.target.name] = value;
    }

    render() {
      return (
        <div className="flex column gaps">
          {
            <>
              <span>
                            Some Text
              </span>
              <Component.Input
                dirty={false}
                name={"version"}
                onChange={this.onChange}
                placeholder={"Version"}
                theme={"round-black"}
                validators={[Component.InputValidators.isRequired]}
                value={this.version}
              />
              <Component.Input
                dirty={false}
                name={"frameworksDirectory"}
                onChange={this.onChange}
                placeholder={"Frameworks Directory"}
                theme={"round-black"}
                validators={[Component.InputValidators.isRequired]}
                value={this.frameworksDirectory}
              />
              <Component.Input
                dirty={false}
                name={"baseDirectory"}
                onChange={this.onChange}
                placeholder={"Base Directory"}
                theme={"round-black"}
                validators={[Component.InputValidators.isRequired]}
                value={this.baseDirectory}
              />
            </>
          }
          <div className="flex column gaps align-flex-start">
            <Component.Button
              label='Save'
              onClick={this.saveChanges}
              primary
              waiting={this.isSaving}
              hidden={!KubescapePreferenceStore.getInstance().isInstalled}
            />
          </div>
        </div>
      )
    }
}

export class KubescapePreferenceHint extends React.Component {
  render() {
    return (
      <span>
      </span>
    )
  }
}