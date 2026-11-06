# Kubescape Lens Extension

[This extension](https://www.armosec.io/blog/kubescape-integrates-with-prometheus-and-lens/?utm_source=github&utm_medium=repository) brings  the power of [Kubescape][kubescape] to [Lens][lens] so managing clusters was never simpler and more secure.

[![License][license-img]][license]
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/kubescape/lens-extension/publish)
![GitHub package.json version](https://img.shields.io/github/package-json/v/kubescape/lens-extension)

## Prerequisites

* Lens should be [installed][lens-installation] on your workstation. Please consult the following support matrix for version compatibility:

  | Lens | Kubescape Extension |
  |------|---------------------|
  | 5.4  | 0.1.x               |
  | 5.5  | 0.1.x               |
  | 6.0  | 0.2.x               |
  | 6.1  | 0.2.x               |

## Installation

1. Open Lens and navigate to the __Extensions__ page (or press <kbd>Command</kbd> + <kbd>Shift</kbd>+<kbd>E</kbd> on macOS).

2. Enter ``@kubescape/lens-extension`` into the __Install Extension__ box

3. Click on the __Install__ button.



<img src="docs/installation.gif"> 


## Getting Started

The Kubescape extension for Lens will help you to easily scan and detect misconfigurations, software vulnerabilities, and RBAC (role-based-access-control) violations in your Kubernetes cluster.

#### Cluster-level information

* Navigate to `Kubescape` from the side menu.
* A Kubescape scan runs automatically on your cluster for the first time. You can also run a scan on-demand by clicking the __Scan__ button.
* The table reflects a cluster-level summary of Kubescape scan results.

<img src="docs/scan-results.png"> 

<br />

* To find out more information on a specific Kubescape control and its failed resources, click on it to open the side bar for a detailed view:

<img src="docs/cluster-level-info.png"> 

#### Object-level information

* Kubescape information is also available at the object level. Click on the desired resource to open the details side bar and scroll down to Kubescape section:

>_This view only shows failed controls. If you don't see any that's a good thing :sweat_smile:_

<img src="docs/object-level-info.png"> 



## Namespace exclusions

Open the application preferences and find **Kubescape Preferences**. Enter a comma-separated
list in **Excluded namespaces**, then click **Save**. For example:
`kube-system,kube-public,monitoring`.

This setting applies to all clusters. By default, no namespaces are excluded. Names must be
valid Kubernetes namespace names; whitespace and duplicate names are removed. Clear the field
and save to remove all exclusions.

Changes apply to subsequent scans. Existing reports stay unchanged until you click **Scan**
on the cluster's Kubescape page. Object details use that same report.

The bundled Kubescape v2.3.1 scanner also skips most cluster-scoped resources, including Nodes
and ClusterRoles, when namespace exclusions are enabled. Namespace objects themselves are
filtered by name. See the [scanner's namespace filtering implementation](https://github.com/kubescape/kubescape/blob/v2.3.1/core/pkg/resourcehandler/fieldselector.go).

## Development mode

> You must have a working [Node.js][nodejs] environment.

1. Clone the repository and then link to it:

```sh
git clone https://github.com/kubescape/lens-extension.git 
mkdir -p ~/.k8slens/extensions
ln -s $(pwd)/lens-extension ~/.k8slens/extensions/kubescape
```

2. Install dependencies and build the extension by running `make` or `npm` commands:

```sh
cd lens-extension
make build
```

__OR__

```sh
cd lens-extension
npm install
npm run build
```

3. To put your development build in watch mode you can run:

```sh
npm start
```

4. Open Lens and navigate to the Extensions page (or press <kbd>Command</kbd> + <kbd>Shift</kbd>+<kbd>E</kbd> on macOS).

5. If everything is fine, you should see the ``@kubescape/lens-extension`` extension listed under __Installed Extensions__. Click __Enable__ to enable it.


To reflect your source code changes, reload the Lens window by pressing <kbd>Command</kbd>+<kbd>R</kbd> (macOS). Note: Any changes which affect Len's main thread will require a restart to the Lens application.


<img src="docs/development.gif"> 

### Verification

```sh
npm ci
npm test
npm run typecheck
npm run build
```

The automated suite uses Lens API doubles and intercepts scanner process execution. It does
not replace testing in Lens/Freelens against a Kubernetes cluster. For runtime acceptance,
scan a disposable cluster containing workloads in `production` and `monitoring`, save
`monitoring` as an exclusion, then scan again. Confirm that production resources remain and
monitoring resources disappear from the new report. Restart the application to check persistence,
then clear the setting and rescan to verify that coverage is restored. Also check the documented
cluster-scoped behavior with a Node or ClusterRole present in the unfiltered report.

### Uninstall

1. Remove the link:
```sh
rm ~/.k8slens/extensions/kubescape
```

2. Restart Lens application.


[lens]: https://github.com/lensapp/lens
[kubescape]: https://github.com/armosec/kubescape
[license]: https://github.com/kubescape/lens-extension/blob/master/LICENSE
[license-img]: https://img.shields.io/github/license/kubescape/lens-extension
[nodejs]: https://www.nodejs.org/en/
[lens-installation]: https://github.com/lensapp/lens#installation
