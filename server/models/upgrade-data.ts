import { IUpgradeData } from './interfaces';


export class UpgradeData implements IUpgradeData {
    
    public batchSize: number;
    public intervalMillis: number;
    public launchConfig: any;
    public secondaryLaunchConfigs: any[];
    public startFirst: boolean;

    constructor(obj: IUpgradeData) {
        this.batchSize = obj.batchSize || 1;
        this.intervalMillis = obj.intervalMillis || 2000;
        this.launchConfig = obj.launchConfig;
        this.secondaryLaunchConfigs = obj.secondaryLaunchConfigs;
        this.startFirst = obj.startFirst || false;
    }
}
