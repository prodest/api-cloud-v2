import { IRancherAPIData, IServiceData, IServiceLinksData, IUpgradeData, IUpgradeRequestData } from '../models/interfaces';
import { AppConfig } from '../config';
import * as request from 'request-promise';
import { UpgradeData } from '../models';

export class RancherService {

    public async upgradeService ( data: IUpgradeRequestData, authorization: string ): Promise<IServiceData> {

        let service: IServiceData;
        const basicOptions = this.getBasicOptions( authorization );

        if ( !data.serviceId ) {
            const rancherURL = `${AppConfig.rancherURL}/projects/`;
            const rancherData = await request( rancherURL, basicOptions );
            const env = rancherData.data.find( ( d: any ) => d.name === data.environment && d.type === 'project' );
            this.notFoundError( env, `Environment ${data.environment}` );
            const envId = env.id;

            const envURL = `${AppConfig.rancherURL}/projects/${envId}/environments`;
            const envData: { data: IRancherAPIData[] } = await request( envURL, basicOptions );
            const stack = envData.data.find( d => d.name === data.stack && d.type === 'environment' );
            this.notFoundError( stack, `Stack ${data.stack}` );
            const stackId = stack.id;

            const stackURL = `${AppConfig.rancherURL}/projects/${envId}/environments/${stackId}/services`;
            const stackData: { data: IServiceData[] } = await request( stackURL, basicOptions );
            service = stackData.data.find( d => d.name === data.service && d.type === 'service' );
            this.notFoundError( service, `Service ${data.service}` );
        } else {
            const serviceURL = `${AppConfig.rancherURL}/services/${data.serviceId}`;
            service = await request( serviceURL, basicOptions );
        }

        const serviceLinksURL = `${AppConfig.rancherURL}/serviceconsumemaps?serviceId=${service.id}`;
        const serviceLinksData: { data: IServiceLinksData[] } = await request( serviceLinksURL, basicOptions );
        const serviceLinks = serviceLinksData.data.map( sl => ( {
            name: sl.name,
            serviceId: sl.consumedServiceId
        } ) );

        const upgradeURL = `${AppConfig.rancherURL}/services/${service.id}/?action=upgrade`;
        const upgradeBody: { inServiceStrategy: IUpgradeData } = {
            inServiceStrategy: new UpgradeData( {
                batchSize: data.batchSize,
                intervalMillis: data.interval,
                launchConfig: service.launchConfig,
                secondaryLaunchConfigs: service.secondaryLaunchConfigs,
                startFirst: data.startFirst
            } )
        };

        if ( data.image ) {
            upgradeBody.inServiceStrategy.launchConfig.imageUuid = `docker:${data.image}`;
        }

        await request( upgradeURL, Object.assign( {
            method: 'POST',
            body: upgradeBody
        }, basicOptions ) );

        const setServiceLinksURL = `${AppConfig.rancherURL}/services/${service.id}/?action=setservicelinks`;
        const setServiceLinksBody: { serviceLinks: any[] } = {
            serviceLinks: serviceLinks
        };
        await request( setServiceLinksURL, Object.assign( {
            method: 'POST',
            body: setServiceLinksBody
        }, basicOptions ) );

        return service;
    }

    public async finishUpgrade ( serviceId: string, authorization: string ): Promise<any> {
        const basicOptions = this.getBasicOptions( authorization );

        const serviceURL = `${AppConfig.rancherURL}/services/${serviceId}`;
        const serviceData: IServiceData = await request( serviceURL, basicOptions );

        if ( serviceData.state === 'upgraded' ) {
            const finishUpgradeURL = `${AppConfig.rancherURL}/services/${serviceId}/?action=finishupgrade`;
            await request( finishUpgradeURL, Object.assign( { method: 'POST' }, basicOptions ) );
            return 'ok';
        }

        return serviceData;
    }

    private getBasicOptions ( authorization: string ) {
        return {
            headers: {
                Authorization: authorization
            },
            json: true
        };
    }

    private notFoundError ( obj: any, name: string ) {
        if ( !obj ) {
            const err = new Error( `${name} not found.` );
            throw err;
        }
    }
}