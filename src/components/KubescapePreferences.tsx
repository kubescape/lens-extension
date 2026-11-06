import { Renderer } from "@k8slens/extensions";
import React from "react";
import { KubescapePreferenceStore } from "../stores";
import { observer } from "mobx-react";
import { action, computed, makeObservable, observable } from "mobx";
import { parseExcludedNamespaces } from "../kubescape/namespaces";

const { Component } = Renderer;

@observer
export class KubescapePreferenceInput extends React.Component {
  @observable excludedNamespaces = KubescapePreferenceStore.getInstance().excludedNamespaces.join(",");

  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

  @computed get validationError(): string {
    try {
      parseExcludedNamespaces(this.excludedNamespaces);
      return "";
    } catch (error) {
      return error.message;
    }
  }

  @action saveChanges = () => {
    if (this.validationError) return;

    const namespaces = parseExcludedNamespaces(this.excludedNamespaces);
    KubescapePreferenceStore.getInstance().excludedNamespaces = namespaces;
    this.excludedNamespaces = namespaces.join(",");
  }

  @action onChange = (value: string) => {
    this.excludedNamespaces = value;
  }

  render() {
    return (
      <div className="flex column gaps">
        <label htmlFor="kubescape-excluded-namespaces">Excluded namespaces</label>
        <Component.Input
          id="kubescape-excluded-namespaces"
          name="excludedNamespaces"
          onChange={this.onChange}
          placeholder="kube-system,kube-public,monitoring"
          theme="round-black"
          value={this.excludedNamespaces}
          aria-invalid={Boolean(this.validationError)}
          aria-describedby="kubescape-excluded-namespaces-help kubescape-excluded-namespaces-error"
        />
        <span id="kubescape-excluded-namespaces-help">
          Enter comma-separated namespace names. Leave empty to exclude nothing.
        </span>
        <span id="kubescape-excluded-namespaces-error" role="alert">{this.validationError}</span>
        <div className="flex column gaps align-flex-start">
          <Component.Button
            label="Save"
            onClick={this.saveChanges}
            primary
            disabled={Boolean(this.validationError)}
          />
        </div>
      </div>
    );
  }
}

export class KubescapePreferenceHint extends React.Component {
  render() {
    return (
      <span>
        Exclusions apply to all clusters on subsequent scans. Click Scan on the Kubescape page to refresh an existing report.
        {" "}With namespace exclusions enabled, Kubescape v2.3.1 also skips most cluster-scoped resources (such as Nodes and ClusterRoles).
        Namespace objects are filtered by name.
      </span>
    );
  }
}
