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

    private static log(level : LogLevels, message : string, ui : boolean) {
        let outputConsole = console.debug

        let longMessage = `[Kubescape] ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')} ${message}`
        switch(level) {
            case LogLevels.Debug:
                longMessage = `${longMessage} - debug `
                break;
            case LogLevels.Error:
                longMessage = `${longMessage} - error `
                outputConsole = console.error
                break;
            case LogLevels.Warning:
                longMessage = `${longMessage} - warn  `
                outputConsole = console.warn
                break;
            case LogLevels.Info:
                longMessage = `${longMessage} - info  `
                outputConsole = console.info
                break;
            default: break
        }

        outputConsole(longMessage)
    }

    public static debug(message: string, ui = false) {
        this.log(LogLevels.Debug, message, ui)
    }

    public static error(message: string, ui = false) {
        this.log(LogLevels.Error, message, ui)
    }

    public static info(message: string, ui = false) {
        this.log(LogLevels.Info, message, ui)
    }

    public static warning(message: string, ui = false) {
        this.log(LogLevels.Warning, message, ui)
    }
}
