import { IRancherAPIData } from '.';

export interface IServiceData extends IRancherAPIData {

    state: string;
    accountId: string;
    assignServiceIpAddress: boolean;
    createIndex: number;
    created: Date;
    createdTS: number;
    description: string;
    environmentId: string;
    externalId: any;
    fqdn: any;
    healthState: string;
    kind: string;
    launchConfig: any;
    metadata: any;
    publicEndpoints: any;
    removed: any;
    retainIp: any;
    scale: number;
    secondaryLaunchConfigs: any[];
    selectorContainer: any;
    selectorLink: any;
    startOnCreate: boolean;
    transitioning: string;
    transitioningMessage: any;
    transitioningProgress: any;
    upgrade: any;
    uuid: string;
    vip: any;
}