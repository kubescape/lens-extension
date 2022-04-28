export function parseScanResult(scanResult: any): any {
    const result = {};
    for (let framework of scanResult) {
        for (let control of framework.controlReports) {
            if (control.controlID in result) {
                continue;
            }
            result[control.controlID] = control;
        }
    }
    return Object.values(result);
}