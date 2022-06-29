import { KubescapeControl } from "../kubescape/types";

export function prevDefault<E extends React.SyntheticEvent | Event>(callback: (evt: E) => any) {
  return function (evt: any) {
    if (evt.target.tagName === "A") {
      return;
    }
    evt.preventDefault();
    evt.stopPropagation();

    return callback(evt);
  };
}

export function stopPropagation(evt: Event | React.SyntheticEvent) {
  evt.stopPropagation();
}
