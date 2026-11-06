import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { KubescapePreferenceStore } from "../src/stores/KubescapePreferenceStore";
import { KubescapeReportStore } from "../src/stores/KubescapeReportStore";
import { KubescapePreferenceHint, KubescapePreferenceInput } from "../src/components/KubescapePreferences";
import KubescapeExtension from "../renderer";

const config = {
  version: "v2.3.1",
  baseDirectory: "/bin",
  frameworksDirectory: "/frameworks",
  scanFrameworks: ["all"],
  requiredFrameworks: [],
};

beforeEach(() => {
  KubescapePreferenceStore.resetInstance();
  KubescapeReportStore.resetInstance();
  KubescapePreferenceStore.createInstance();
  KubescapeReportStore.createInstance();
});

test("new and legacy preferences exclude nothing", () => {
  const store = KubescapePreferenceStore.getInstance();
  expect(store.excludedNamespaces).toEqual([]);
  store.excludedNamespaces = ["monitoring"];
  (store as any).fromStore({ kubescapeConfig: config, isInstalled: true });
  expect(store.toJSON()).toEqual({ kubescapeConfig: config, isInstalled: true, excludedNamespaces: [] });
});

test("preferences survive a JSON round trip independently of installation configuration", () => {
  const store = KubescapePreferenceStore.getInstance();
  (store as any).fromStore({ kubescapeConfig: config, isInstalled: true, excludedNamespaces: ["monitoring"] });
  const serialized = JSON.stringify(store.toJSON());
  const restored = new KubescapePreferenceStore();
  (restored as any).fromStore(JSON.parse(serialized));
  expect(restored.toJSON()).toEqual(store.toJSON());
  const snapshot = store.toJSON();
  snapshot.excludedNamespaces.push("other");
  expect(store.excludedNamespaces).toEqual(["monitoring"]);
});

test("saving normalizes the list and leaves configuration and reports unchanged", () => {
  const store = KubescapePreferenceStore.getInstance();
  store.kubescapeConfig = config;
  store.isInstalled = true;
  const reportStore = KubescapeReportStore.getInstance();
  reportStore.scanResults = [{ clusterId: "existing", controls: [], isScanning: false } as any];
  const previousReport = JSON.stringify(reportStore.toJSON());
  const input = new KubescapePreferenceInput({});
  input.onChange(" monitoring, kube-system,monitoring, ");
  input.saveChanges();
  expect(store.toJSON()).toEqual({ kubescapeConfig: config, isInstalled: true, excludedNamespaces: ["monitoring", "kube-system"] });
  expect(input.excludedNamespaces).toBe("monitoring,kube-system");
  expect(JSON.stringify(reportStore.toJSON())).toBe(previousReport);
  expect(new KubescapePreferenceInput({}).excludedNamespaces).toBe("monitoring,kube-system");
});

test("an empty field clears exclusions, including before installation finishes", () => {
  const store = KubescapePreferenceStore.getInstance();
  store.excludedNamespaces = ["monitoring"];
  const input = new KubescapePreferenceInput({});
  input.onChange(" , ");
  input.saveChanges();
  expect(store.excludedNamespaces).toEqual([]);
  const html = renderToStaticMarkup(<KubescapePreferenceInput />);
  expect(html).toContain(">Save</button>");
  expect(html).not.toMatch(/disabled|hidden/);
});

test("invalid edits show an error, disable Save and cannot overwrite saved values", () => {
  const store = KubescapePreferenceStore.getInstance();
  store.excludedNamespaces = ["monitoring"];
  const input = new KubescapePreferenceInput({});
  input.onChange("production;whoami");
  expect(input.validationError).toMatch(/1–63/);
  const html = renderToStaticMarkup(input.render());
  expect(html).toContain('aria-invalid="true"');
  expect(html).toContain('role="alert"');
  expect(html).toContain('disabled=""');
  input.saveChanges();
  expect(store.excludedNamespaces).toEqual(["monitoring"]);
  input.onChange("production");
  expect(input.validationError).toBe("");
});

test("the renderer registers the real settings input and coverage guidance", () => {
  const extension = new KubescapeExtension({} as any);
  const preference = extension.appPreferences.find(item => item.title === "Kubescape Preferences");
  expect(preference.components.Input().type).toBe(KubescapePreferenceInput);
  expect(preference.components.Hint().type).toBe(KubescapePreferenceHint);
  const html = renderToStaticMarkup(preference.components.Hint());
  expect(html).toContain("all clusters");
  expect(html).toContain("subsequent scans");
  expect(html).toContain("Click Scan");
  expect(html).toContain("cluster-scoped resources");
});
