import { Request, Response, Router, NextFunction } from 'express';

export class PingRouter {
    private router: Router;

    constructor() {
        this.router = Router();
        this.routers();
    }

    public routers () {
        /* GET rota de verificação. */
        this.router.get( '/', ( req: Request, res: Response, next: NextFunction ) => res.status( 200 ).json( 'pong' ) );

    }

    public getRouter (): Router {
        return this.router;
    }
}
