# Issue #15: namespace exclusions

Research verified on 23 October 2026 against the checkout, published SDK, and upstream sources.

## Findings

- [Issue #15](https://github.com/kubescape/lens-extension/issues/15) remained open. The [repository](https://github.com/kubescape/lens-extension) was not archived; its latest default-branch commit was [6b70a17](https://github.com/kubescape/lens-extension/commit/6b70a17faa18feb63e6e31999d7d7209a3c4b9e7), dated 20 January 2026. The [open pull request collection](https://api.github.com/repos/kubescape/lens-extension/pulls?state=open&per_page=100) was empty, and all-state PR searches for `namespace`, `exclude`, and `15` found no candidate fix. These are point-in-time checks.
- The original [IPC handler](https://github.com/kubescape/lens-extension/blob/6b70a17faa18feb63e6e31999d7d7209a3c4b9e7/src/ipc/main.ts) forwarded only the UI, cluster context, and kubeconfig path. [Workload details](https://github.com/kubescape/lens-extension/blob/6b70a17faa18feb63e6e31999d7d7209a3c4b9e7/src/components/KubescapeWorkloadDetails.tsx) read the shared cluster report rather than running separate resource scans.
- The locked [published `@kubescape/install` 0.4.0 package](https://registry.npmjs.org/@kubescape/install/-/install-0.4.0.tgz), inspected at `package/out/src/index.d.ts` and `package/out/src/index.js`, supports `scanCluster(ui, context, kubeconfigPath?, overrideArgs?)`. The fourth argument is merged into the CLI options. Passing `{ "exclude-namespaces": namespaces.join(",") }` needs no SDK upgrade. Its `IKubescapeConfig` has no namespace exclusion field, so this is an extension-owned preference.
- That SDK interpolates argument values into a command string and executes it with `child_process.exec`. Namespace input must therefore be validated before invocation, including in the main process: accept exact Kubernetes namespace names, normalize whitespace and duplicates, and reject invalid names or shell metacharacters. Do not expose unrestricted CLI arguments. Kubernetes requires namespace names to be [DNS labels](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#dns-label-names).

## Compatibility decisions

- Preserve existing behavior with an empty exclusions default, including when loading preferences saved before the new setting existed. Omit the CLI override for an empty list. `kube-system,kube-public,monitoring` is an example, not an automatic exclusion policy. [Official scanning examples](https://kubescape.io/docs/scanning/) show the comma-separated flag syntax.
- The extension pins [Kubescape v2.3.1](https://github.com/kubescape/lens-extension/blob/6b70a17faa18feb63e6e31999d7d7209a3c4b9e7/src/utils/consts.ts). In this version, **namespace exclusions also skip cluster-scoped resources other than Namespace objects**. The [flag definition](https://github.com/kubescape/kubescape/blob/v2.3.1/cmd/scan/scan.go#L75) documents this behavior. [`ExcludeSelector.GetClusterScope`](https://github.com/kubescape/kubescape/blob/v2.3.1/core/pkg/resourcehandler/fieldselector.go#L35) permits only Namespace objects at cluster scope, and [resource collection](https://github.com/kubescape/kubescape/blob/v2.3.1/core/pkg/resourcehandler/k8sresources.go#L316) skips other cluster-scoped kinds. Namespace objects are matched by name; namespaced resources are matched by namespace. Disclose this limitation in the setting help and usage documentation.

## Verification boundary

Local regression checks should cover preference persistence and legacy defaults, valid and invalid input, renderer-to-IPC-to-SDK forwarding, empty-list flag omission, and command construction using the installed SDK. These verify the extension's integration contract; mocked scanner calls do not prove live collection behavior.

A real Lens/Freelens and Kubernetes acceptance check must verify persistence across restart, an included namespace canary, an excluded namespace canary, clearing exclusions, refreshing an existing report, and the pinned scanner's cluster-scoped behavior. Live acceptance results must be reported separately from local unit, type-check, and build results.
