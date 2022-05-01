export function parseScanResult(scanResult: any) {
    const controls = {};
    const frameworks = [];

    for (let framework of scanResult) {
        const { controlReports, ...frameworkData } = framework
        for (let control of controlReports) {
            if (control.controlID in controls) {
                continue;
            }
            controls[control.controlID] = control;
        }
        
        frameworks.push(frameworkData);
    }
    return [Object.values(controls), frameworks] as const;
}