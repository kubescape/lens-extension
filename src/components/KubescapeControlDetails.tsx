import React from "react";

import { Renderer } from "@k8slens/extensions";
import { observable, makeObservable, computed, reaction, runInAction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react"
import { KubescapeControl } from "../kubescape/types";
import { docsUrl, getRelatedObjectsFromControl } from "../kubescape/controlUtils";
import { KubescapeControlSeverity } from "./KubescapeControlSeverity";
import { KubescapeReportStore } from "../stores";

const { Component: { Drawer, DrawerItem, DrawerTitle, Icon, Table, TableHead, TableCell, TableRow } } = Renderer;


class RelatedResource {
  id: string
  name: string
  kind: string
  namespace: string;
  detailsUrl: string;

  public constructor(init?: Partial<RelatedResource>) {
    Object.assign(this, init);
  }
}

class RoleBasedResource extends RelatedResource {
  role: RelatedResource
  roleBinding: RelatedResource
}

@observer
export class KubescapeControlDetails extends React.Component<{ control?: KubescapeControl, onClose?: () => void }> {
  constructor(props) {
    super(props);
    makeObservable(this);
  }

    @observable failedResources: RelatedResource[] | RoleBasedResource[] = null;

    @computed get control() {
      return this.props.control;
    }

    @computed get store() {
      return KubescapeReportStore.getInstance();
    }

    async componentDidMount() {
      disposeOnUnmount(this, [
        reaction(() => this.control,
          async () => {
            this.failedResources = null;
            const result = await this.resolveFailedResources();
            runInAction(() => {
              this.failedResources = result;
            })
          }
        )]
      );
    }

    resolveFailedResources = async () => {
      if (!this.control) {
        return null;
      }

      const relatedObjects = getRelatedObjectsFromControl(this.control.rawResult)
      return await Promise.all(relatedObjects.map(async (entity) => {
        if (entity.metadata?.uid) {
          const kubeObject = await this.store.getKubeObject(entity.metadata.namespace, entity.kind, entity.apiVersion, entity.metadata.uid)
          return new RelatedResource({
            id: entity.metadata.uid,
            name: kubeObject.getName(),
            kind: kubeObject.kind,
            namespace: kubeObject.metadata.namespace,
            detailsUrl: Renderer.Navigation.getDetailsUrl(kubeObject.selfLink)
          });
        }

        const roleBasedResource: RoleBasedResource = new RoleBasedResource({
          kind: entity.kind,
          name: entity.name,
          namespace: entity.namespace
        });

        for (const relatedObject of entity.relatedObjects) {
          const kubeObject = await this.store.getKubeObject(relatedObject.metadata.namespace, relatedObject.kind, relatedObject.apiVersion, relatedObject.metadata.uid)
          if (relatedObject.kind.includes("RoleBinding")) {
            roleBasedResource.roleBinding = new RelatedResource({
              name: kubeObject.getName(),
              detailsUrl: Renderer.Navigation.getDetailsUrl(kubeObject.selfLink)
            });
          } else {
            roleBasedResource.role = new RelatedResource({
              name: kubeObject.getName(),
              detailsUrl: Renderer.Navigation.getDetailsUrl(kubeObject.selfLink)
            });
          }
        }

        return roleBasedResource;
      }));
    }


    @computed get title() {
      return this.control ? `${this.control.id} - ${this.control.name}` : null;
    }

    @computed get controlDetails() {
      if (!this.control) {
        return null;
      }

      return (<>
        <DrawerTitle>{this.control.name}</DrawerTitle>
        <DrawerItem name="Description">{this.control.description}</DrawerItem>
        <DrawerItem name="Severity"><KubescapeControlSeverity control={this.control} /></DrawerItem>
        <DrawerItem name="Remediation">{this.control.remediation}</DrawerItem>
        <DrawerItem name="More Information">
          <a target="_blank" href={docsUrl(this.control)}><Icon material="open_in_browser"></Icon></a>
        </DrawerItem>
      </>);
    }

    navigationLink = (resource: RelatedResource) => <a href="#" onClick={(e) => {e.preventDefault(); Renderer.Navigation.navigate(resource.detailsUrl); this.props.onClose()}}>{resource.name}</a>

    @computed get failedResourcesTable() {
      if (!this.failedResources || this.failedResources.length == 0) {
        return null;
      }

      let columns;

      if (this.failedResources[0] instanceof RoleBasedResource) {
        columns = [
          { title: "Namespace", value: (resource: RoleBasedResource) => resource.namespace },
          { title: "Role", value: (resource: RoleBasedResource) => this.navigationLink(resource.role) },
          { title: "RoleBinding", value: (resource: RoleBasedResource) => this.navigationLink(resource.roleBinding) },
          { title: "Subject", value: (resource: RoleBasedResource) => resource.name },
        ]
      } else {
        columns = [
          { title: "Namespace", value: (resource: RelatedResource) => resource.namespace },
          { title: "Kind", value: (resource: RelatedResource) => resource.kind },
          { title: "Name", value: (resource: RelatedResource) => this.navigationLink(resource) },
        ]
      }

      return (<><DrawerTitle>Failed Resources</DrawerTitle>
        <Table>
          <TableHead>{columns.map(col => <TableCell>{col.title}</TableCell>)}</TableHead>
          {this.failedResources.map(resource => <TableRow>{columns.map(col => <TableCell>{col.value(resource)}</TableCell>)}</TableRow>)}
        </Table>
      </>);
    }

    render() {
      const { onClose } = this.props;

      return (
        <Drawer
          className="KubeObjectDetails flex column"
          open={this.control != null}
          title={this.title}
          toolbar={null}
          onClose={onClose}
        >
          {this.controlDetails}
          {this.failedResourcesTable}
        </Drawer>
      );
    }
}