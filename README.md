# Kubescape Lens Extension

This extension bring out the power of [Kubescape][kubescape] into [Lens][lens] so managing cluster was never simpler and safer.

[![License][license-img]][license]

## Prerequisites

* Lens minimum [5.4.0][lens-version] should first be [installed][lens-installation] on your workstation.


## Installation

1. Open Lens and navigate to the __Extensions__ page (or press <kbd>Command</kbd> + <kbd>Shift</kbd>+<kbd>E</kbd> on macOS).

2. Enter ``@kubescape/lens-extension`` into the __Install Extension__ box

3. Click on the __Install__ button.

<img src="docs/installation.gif"> 

## Development mode

> You must have a working [Node.js][nodejs] environment.

1. Clone the repository and then link to it:

```sh
git clone https://github.com/armosec/lens-kubescape.git 
mkdir -p ~/.k8slens/extensions
ln -s $(pwd)/lens-kubescape ~/.k8slens/extensions/kubescape
```

2. Install dependencies and build the extension by running `make` or `npm` commands:

```sh
cd lens-kubescape
make build
```

__OR__

```sh
cd lens-kubescape
npm install
npm run build
```

3. To put your development build into watch mode you can run:

```sh
npm start
```

4. Open Lens and navigate to the Extensions page (or press <kbd>Command</kbd> + <kbd>Shift</kbd>+<kbd>E</kbd> on macOS).

5. If everything is fine, you should see the ``@kubescape/lens-extension`` extension listed under __Installed Extensions__. Click __Enable__ to enable it


To reflect your source code changes, reload the Lens window by pressing <kbd>Command</kbd>+<kbd>R</kbd> (macOS). Note: Any changes which affect Len's main thread will require a restart to the Lens application.


<img src="docs/development.gif"> 

## Test

Open Lens application and navigate to a cluster. You should see "Kubescape" in a menu.

## Uninstall

```sh
rm ~/.k8slens/extensions/kubescape
```

Restart Lens application.

[lens]: https://github.com/lensapp/lens
[kubescape]: https://github.com/armosec/kubescape
[license]: https://github.com/armosec/lens-kubescape/blob/master/LICENSE
[license-img]: https://img.shields.io/github/license/armosec/lens-kubescape
[nodejs]: https://www.nodejs.org/en/
[lens-version]: https://github.com/lensapp/lens/releases/tag/v5.4.6
[lens-installation]: https://github.com/lensapp/lens#installation
