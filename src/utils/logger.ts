enum LogLevels {
    Debug, Error, Warning, Info
}

export class Logger {
  private static _instance: Logger = new Logger();

  private constructor() {
    if (!Logger._instance) {
      Logger._instance = this
    }

  }

  private static log(level : LogLevels, message : any, ui : boolean) {
    let outputConsole = console.debug

    let longMessage = `[Kubescape] ${new Date().toISOString().replace(/T/, " ").replace(/\..+/, "")}`
    switch(level) {
    case LogLevels.Debug:
      outputConsole({info: longMessage, content:message})
      return
    case LogLevels.Error:
      longMessage = `${longMessage} - error - `
      outputConsole = console.error
      break;
    case LogLevels.Warning:
      longMessage = `${longMessage} - warn  - `
      outputConsole = console.warn
      break;
    case LogLevels.Info:
      longMessage = `${longMessage} - info  - `
      outputConsole = console.info
      break;
    default: break
    }

    longMessage += message

    outputConsole(longMessage)
  }

  public static debug(message: any, ui = false) {
    this.log(LogLevels.Debug, message, ui)
  }

  public static error(message: any, ui = false) {
    this.log(LogLevels.Error, message, ui)
  }

  public static info(message: any, ui = false) {
    this.log(LogLevels.Info, message, ui)
  }

  public static warning(message: any, ui = false) {
    this.log(LogLevels.Warning, message, ui)
  }
}
