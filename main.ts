import { Main } from "@k8slens/extensions";

export default class KubescapeExtensionMain extends Main.LensExtension {
  onActivate() {
    console.log('Kubescape main activated');
  }

  onDeactivate() {
    console.log('Kubescape main de-activated');
  }
}
