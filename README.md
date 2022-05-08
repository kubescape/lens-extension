# Kubescape Lens Extension

This extension bring out the power of [Kubescape][kubescape] into [Lens][lens] so managing cluster was never simpler and safer.

[![License][license-img]][license]

## Install

```sh
mkdir -p ~/.k8slens/extensions
git clone https://github.com/armosec/lens-kubescape.git
ln -s $(pwd)/lens-kubescape ~/.k8slens/extensions/kubescape
```

## Build

To build the extension you can use `make` or run the `npm` commands manually:

```sh
cd lens-kubescape
make build
```

OR

```sh
cd lens-kubescape
npm install
npm run build
```

If you want to watch for any source code changes and automatically rebuild the extension you can use:

```sh
cd lens-kubescape
npm start
```

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
