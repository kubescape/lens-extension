import { AbortController } from "abort-controller"

import { KubescapeUi } from "@kubescape/install"
import { Logger } from "../utils/logger"

export class LensUI implements KubescapeUi {
  slow<T>(title: string, work: () => Promise<T>): Promise<T> {
    Logger.info(title)
    return work()
  }

  progress<T>(title: string, cancel: AbortController | null,
    body: (progress: (fraction: number) => void) => Promise<T>) : Promise<T> {
    let lastFraction = 0
    return body(fraction => {
      if (fraction > lastFraction) {
        const per = fraction * 100
        if (per % 5 == 0)
        {
          Logger.info(`${title}: ${per}%`)
        }
        lastFraction = fraction;
      }
    })
  }

  error(s: string) { Logger.error(s) }
  info(s: string)  { Logger.info(s) }
  debug(s: string) { Logger.debug(s) }

  async showHelp(message: string, url: string) {
    message += ` See ${url}.`
    Logger.info(message)
  }
}