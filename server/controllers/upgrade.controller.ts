import { Request } from 'express';
import { IUpgradeRequestData } from '../models/interfaces';
import { RancherService } from '../services/rancher.service';

export class UpgradeController {

    private validateUpgradeData ( data: IUpgradeRequestData ) {
        if ( !data.environment ) {
            throw new Error( 'Environment name is required.' );
        }
        if ( !data.stack ) {
            throw new Error( 'Stack name is required.' );
        }
        if ( !data.service ) {
            throw new Error( 'Service name is required.' );
        }
    }

    public async upgradeService ( req: Request ): Promise<any> {
        const data: IUpgradeRequestData = req.body;

        this.validateUpgradeData( data );

        return new RancherService().upgradeService( data, req.get( 'Authorization' ) );
    }

    public async finishUpgrade ( req: Request, serviceId: string ): Promise<any> {

        return new RancherService().finishUpgrade( serviceId, req.get( 'Authorization' ) );
    }
}
