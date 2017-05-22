
export interface IUpgradeRequestData {

    environment: string;
    stack: string;
    service: string;
    
    image: string;
    batchSize?: number;
    interval?: number;
    startFirst?: boolean;
}