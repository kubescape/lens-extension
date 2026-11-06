// Only the Lens host boundary is doubled; application code and MobX remain real.
const React = require("react");
const { observable } = require("mobx");
const instances = new Map();

class Singleton {
  static createInstance(...args) {
    if (!instances.has(this)) instances.set(this, new this(...args));
    return instances.get(this);
  }

  static getInstance() {
    if (!instances.has(this)) throw new Error("Instance has not been created");
    return instances.get(this);
  }

  static resetInstance() { instances.delete(this); }
}

class ExtensionStore extends Singleton {
  constructor(params) {
    super();
    this.params = params;
  }

  loadExtension() {}
}

class Ipc extends Singleton {
  constructor() {
    super();
    this.handlers = new Map();
    this.invoke = jest.fn();
  }

  handle(name, handler) {
    this.handlers.set(name, handler);
  }
}

class KubernetesCluster {
  spec = { kubeconfigContext: "test-context", kubeconfigPath: "/test kubeconfig" };
  getId() { return "test-cluster"; }
  getName() { return "Test cluster"; }
}

class LensExtension {}

const Component = {
  Input: ({ theme, onChange, ...props }) => React.createElement("input", {
    ...props,
    onChange: event => onChange(event.target.value, event),
  }),
  Button: ({ label, primary, waiting, ...props }) => React.createElement("button", props, label),
};

module.exports = {
  Common: { Store: { ExtensionStore }, Catalog: { KubernetesCluster } },
  Main: { Ipc, LensExtension },
  Renderer: {
    Ipc,
    LensExtension,
    Component,
    Catalog: { catalogEntities: observable({ activeEntity: null }) },
  },
};
