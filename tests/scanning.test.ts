import childProcess from "child_process";
import fs from "fs";
import { Common, Renderer } from "@k8slens/extensions";
import { KubescapeApi } from "@kubescape/install";
import { runInAction } from "mobx";
import KubescapeExtension from "../renderer";
import { ClusterPage } from "../src/components/ClusterPage";
import { KubescapePreferenceInput } from "../src/components/KubescapePreferences";
import { KubescapeWorkloadDetails } from "../src/components/KubescapeWorkloadDetails";
import { IpcMain } from "../src/ipc/main";
import { IpcRenderer } from "../src/ipc/renderer";
import { scanClusterTask } from "../src/kubescape/clusterScan";
import { getResourceIdByUid } from "../src/kubescape/controlUtils";
import { KubescapePreferenceStore, KubescapeReportStore } from "../src/stores";
import { SCAN_CLUSTER_EVENT_NAME } from "../src/utils/consts";

// The host double exposes a writable catalog to simulate Lens selection changes.
const catalog = Renderer.Catalog.catalogEntities as unknown as { activeEntity: any };

function report(namespaces = ["production"]) {
  return {
    resources: namespaces.map(namespace => ({
      resourceID: `${namespace}/pod`,
      object: { kind: "Pod", metadata: { namespace, uid: `${namespace}-uid`, name: "pod" } },
    })),
    results: namespaces.map(namespace => ({
      resourceID: `${namespace}/pod`,
      controls: [{ controlID: "C-0001", rules: [{ status: "failed" }] }],
    })),
    summaryDetails: {
      controls: {
        "C-0001": {
          controlID: "C-0001", name: "Test control", resourceIDs: {},
          ResourceCounters: { failedResources: namespaces.length },
          statusInfo: { status: "failed" }, scoreFactor: 7, score: 100,
        },
      },
    },
  };
}

function handler() {
  const main = new IpcMain({} as any);
  return (main as any).handlers.get(SCAN_CLUSTER_EVENT_NAME);
}

beforeEach(() => {
  KubescapePreferenceStore.resetInstance();
  KubescapeReportStore.resetInstance();
  IpcRenderer.resetInstance();
  KubescapePreferenceStore.createInstance();
  KubescapeReportStore.createInstance();
  runInAction(() => { catalog.activeEntity = null; });
  jest.spyOn(console, "debug").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
});

test("the main-process handler forwards only the normalized namespace override", async () => {
  const scan = jest.spyOn(KubescapeApi.instance, "scanCluster").mockResolvedValue(report());
  await handler()({}, "context", "/kube config", [" monitoring ", "kube-system", "monitoring"]);
  expect(scan).toHaveBeenCalledWith(expect.anything(), "context", "/kube config", {
    "exclude-namespaces": "monitoring,kube-system",
  });
});

test.each([undefined, [], [" "]].map(names => ({ names })))("empty or legacy exclusions $names omit the SDK override", async ({ names }) => {
  const scan = jest.spyOn(KubescapeApi.instance, "scanCluster").mockResolvedValue(report());
  await handler()({}, "context", undefined, names);
  expect(scan).toHaveBeenCalledWith(expect.anything(), "context", undefined);
});

test.each([null, "monitoring", {}, [1], ["valid", null], ["UPPER"], ["a".repeat(64)],
  ["kube-*"], ["monitoring;whoami"], ["$(whoami)"], ["`whoami`"], ["--help"]].map(names => ({ names })))(
  "invalid IPC input $names never invokes the scanner", async ({ names }) => {
    const scan = jest.spyOn(KubescapeApi.instance, "scanCluster");
    await expect(handler()({}, "context", "/config", names)).rejects.toThrow(/namespace/);
    expect(scan).not.toHaveBeenCalled();
  },
);

test.each([["monitoring", "kube-system"], []].map(names => ({ names })))("the installed SDK builds the expected command for $names", async ({ names: excludedNamespaces }) => {
  const api = KubescapeApi.instance;
  jest.spyOn(api, "path", "get").mockReturnValue("/fake kubescape");
  jest.spyOn(api, "frameworkDirectory", "get").mockReturnValue("/fake frameworks");
  jest.spyOn(api, "frameworksNames", "get").mockReturnValue(["all"]);
  jest.spyOn(api, "getControlsMap").mockResolvedValue(new Map());
  const exec = jest.spyOn(childProcess, "exec").mockImplementation(((command, options, callback) => {
    const output = /--output "([^"]+)"/.exec(command);
    expect(output).not.toBeNull();
    fs.writeFileSync(output[1], JSON.stringify(report()));
    callback(null, "", "");
    return {};
  }) as any);

  const result = await handler()({}, "test-context", "/test kubeconfig", excludedNamespaces);
  expect(result.resources[0].object.metadata.namespace).toBe("production");
  expect(exec).toHaveBeenCalledTimes(1);
  const command = exec.mock.calls[0][0] as string;
  expect(command).toContain('"/fake kubescape" scan framework all');
  expect(command).toContain('"/test kubeconfig"');
  expect(command).toContain('--use-artifacts-from "/fake frameworks"');
  expect(command).toContain("--kube-context test-context");
  expect(command).toContain("--format-version v2");
  if (excludedNamespaces.length) {
    expect(command).toContain("--exclude-namespaces monitoring,kube-system");
  } else {
    expect(command).not.toContain("--exclude-namespaces");
  }
});

test("automatic and manual scans use saved settings; saving alone leaves the existing report intact", async () => {
  const extension = new KubescapeExtension({} as any);
  const scan = jest.spyOn(KubescapeApi.instance, "scanCluster").mockResolvedValue(report(["production", "monitoring"]));
  const onScanCluster = handler();
  await extension.onActivate();
  try {
    const preferences = KubescapePreferenceStore.getInstance();
    const reports = KubescapeReportStore.getInstance();
    const ipc = IpcRenderer.getInstance();
    const invoke = ipc.invoke as jest.Mock;
    invoke.mockImplementation((event, ...args) => onScanCluster({}, ...args));
    runInAction(() => { preferences.isInstalled = true; });
    runInAction(() => {
      catalog.activeEntity = new Common.Catalog.KubernetesCluster({} as any);
    });
    await new Promise(resolve => setImmediate(resolve));
    expect(invoke).toHaveBeenCalledWith(SCAN_CLUSTER_EVENT_NAME, "test-context", "/test kubeconfig", []);
    expect(scan).toHaveBeenCalledWith(expect.anything(), "test-context", "/test kubeconfig");
    expect(Object.keys(reports.kubescapeRawResourceMap)).toEqual(["production/pod", "monitoring/pod"]);

    const previousReport = JSON.stringify(reports.toJSON());
    const input = new KubescapePreferenceInput({});
    input.onChange("monitoring");
    input.saveChanges();
    expect(JSON.stringify(reports.toJSON())).toBe(previousReport);
    expect(scan).toHaveBeenCalledTimes(1);
    scan.mockResolvedValue(report());
    await new ClusterPage({}).scanCluster();
    expect(scan).toHaveBeenLastCalledWith(expect.anything(), "test-context", "/test kubeconfig", {
      "exclude-namespaces": "monitoring",
    });
    expect(invoke.mock.calls[1][3]).toEqual(["monitoring"]);
    expect(invoke.mock.calls[1][3]).not.toBe(preferences.excludedNamespaces);
    expect(reports.activeClusterReportResult.isScanning).toBe(false);
    expect(reports.kubescapeControls[0].relatedResourceIds).toEqual(["production/pod"]);
    expect(getResourceIdByUid(reports.kubescapeRawResourceMap, "production-uid")).toBe("production/pod");
    expect(getResourceIdByUid(reports.kubescapeRawResourceMap, "monitoring-uid")).toBeNull();
    jest.spyOn(console, "error").mockImplementation(() => {});
    const excludedDetails = new KubescapeWorkloadDetails({ object: { getId: () => "monitoring-uid" } } as any);
    expect(excludedDetails.render()).toBeNull();
    const includedDetails = new KubescapeWorkloadDetails({ object: { getId: () => "production-uid" } } as any);
    expect(includedDetails.render()).not.toBeNull();

    input.onChange("");
    input.saveChanges();
    scan.mockResolvedValue(report(["production", "monitoring"]));
    await new ClusterPage({}).scanCluster();
    expect(scan).toHaveBeenLastCalledWith(expect.anything(), "test-context", "/test kubeconfig");
    expect(Object.keys(reports.kubescapeRawResourceMap)).toContain("monitoring/pod");
  } finally {
    await extension.onDeactivate();
  }
});

test.each(["selection", "installation"])("automatic scans triggered by %s use saved exclusions", async trigger => {
  const extension = new KubescapeExtension({} as any);
  const scan = jest.spyOn(KubescapeApi.instance, "scanCluster").mockResolvedValue(report());
  const onScanCluster = handler();
  await extension.onActivate();
  try {
    const preferences = KubescapePreferenceStore.getInstance();
    const invoke = IpcRenderer.getInstance().invoke as jest.Mock;
    invoke.mockImplementation((event, ...args) => onScanCluster({}, ...args));
    const input = new KubescapePreferenceInput({});
    input.onChange("monitoring,kube-system");
    input.saveChanges();
    const selectCluster = () => runInAction(() => { catalog.activeEntity = new Common.Catalog.KubernetesCluster({} as any); });
    const finishInstallation = () => runInAction(() => { preferences.isInstalled = true; });
    if (trigger === "selection") {
      finishInstallation();
      selectCluster();
    } else {
      selectCluster();
      finishInstallation();
    }
    await new Promise(resolve => setImmediate(resolve));
    expect(scan).toHaveBeenCalledTimes(1);
    expect(scan).toHaveBeenCalledWith(expect.anything(), "test-context", "/test kubeconfig", {
      "exclude-namespaces": "monitoring,kube-system",
    });
  } finally {
    await extension.onDeactivate();
  }
});

test("a scan uses a snapshot of exclusions even if preferences change while IPC is pending", async () => {
  const preferences = KubescapePreferenceStore.getInstance();
  preferences.isInstalled = true;
  preferences.excludedNamespaces = ["monitoring"];
  runInAction(() => { catalog.activeEntity = new Common.Catalog.KubernetesCluster({} as any); });
  let resolveScan: (value: any) => void;
  const ipc = { invoke: jest.fn((...args: any[]) => new Promise(resolve => { resolveScan = resolve; })) };
  const task = scanClusterTask(preferences, KubescapeReportStore.getInstance(), ipc);
  preferences.excludedNamespaces.push("other");
  expect(ipc.invoke.mock.calls[0][3]).toEqual(["monitoring"]);
  resolveScan(report());
  await task;
});
