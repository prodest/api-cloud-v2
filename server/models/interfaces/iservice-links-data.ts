import { IRancherAPIData } from '.';

export interface IServiceLinksData extends IRancherAPIData {
    state: string;
    accountId: string;
    consumedServiceId: string;
    created: string;
    createdTS: number;
    data: any;
    description: string;
    kind: string;
    ports: any;
    removeTime: any;
    removed: any;
    serviceId: string;
    transitioning: string;
    transitioningMessage: any;
    transitioningProgress: any;
    uuid: string;
}
