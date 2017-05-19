import { Request, Response, Router, NextFunction } from 'express';
import { UpgradeController } from '../controllers';


export class UpgradeRouter {
    private router: Router;
    private controller: UpgradeController;

    constructor() {
        this.controller = new UpgradeController();
        
        this.router = Router();
        this.routers();
    }

    private respond ( promise: Promise<any>, res: Response, next: NextFunction ) {
        promise
        .then( data => res.json( data ) )
        .catch( error => next( error ) );
    }

    public routers () {
        
        this.router.post( '/', ( req: Request, res: Response, next: NextFunction ) => this.respond( this.controller.upgradeService( req ), res, next ) );
        this.router.post( '/finish/:serviceId', ( req: Request, res: Response, next: NextFunction ) => this.respond( this.controller.finishUpgrade( req, req.params.serviceId ), res, next ) );
        // this.router.post( '/rollback/:serviceId', ( req: Request, res: Response, next: NextFunction ) => res.status( 200 ).json( 'status' ) );
    }

    public getRouter (): Router {
        return this.router;
    }
}
