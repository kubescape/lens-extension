import { normalizeExcludedNamespaces, parseExcludedNamespaces } from "../src/kubescape/namespaces";

describe("namespace input", () => {
  test("trims, drops empty entries and deduplicates without reordering", () => {
    expect(parseExcludedNamespaces(" kube-system, ,monitoring,kube-system, kube-public, "))
      .toEqual(["kube-system", "monitoring", "kube-public"]);
  });

  test.each(["", " ", ", ,,"])("allows clearing with %j", value => {
    expect(parseExcludedNamespaces(value)).toEqual([]);
  });

  test.each(["a", "0", "1-app", "a".repeat(63), "a-1"])("accepts %s", value => {
    expect(parseExcludedNamespaces(value)).toEqual([value]);
  });

  test.each([
    "a".repeat(64), "UPPER", "-app", "app-", "my_namespace", "my.namespace",
    "my namespace", "kube-*", "--help", "app;whoami", "$(whoami)", "`whoami`",
    "app|whoami", "app&whoami", "app>file", '"app"', "app\nother", "équipe",
  ])("rejects invalid or unsafe input %j without dropping it", value => {
    expect(() => parseExcludedNamespaces(`production,${value}`)).toThrow(/namespace names/);
  });

  test.each([null, "monitoring", {}, [1], [null], ["valid", {}]].map(value => ({ value })))("rejects malformed IPC value $value", ({ value }) => {
    expect(() => normalizeExcludedNamespaces(value)).toThrow(/list of namespace names/);
  });

  test("omitted lists use the legacy empty default and normalization returns a copy", () => {
    expect(normalizeExcludedNamespaces()).toEqual([]);
    const names = ["monitoring"];
    expect(normalizeExcludedNamespaces(names)).not.toBe(names);
    expect(names).toEqual(["monitoring"]);
  });
});
