# Kubescape extension for Lens

This extension bring out the power of kubescape into Lens so managing cluster
was never simpler and safer.

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
npm run dev
```

## Test

Open Lens application and navigate to a cluster. You should see "Kubescape" in a menu.

## Uninstall

```sh
rm ~/.k8slens/extensions/helloworld-sample
```

Restart Lens application.
