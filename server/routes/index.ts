import { Application, Router } from 'express';
import { AppConfig } from '../config';
import { PingRouter } from './ping.router';
import { UpgradeRouter } from './upgrade.router';

export namespace main {
    
    export const callRoutes = ( app: Application, appConfig: AppConfig ): Application => {
        const router: Router = Router();

        router.use( '/api/v1/ping', new PingRouter().getRouter() );
        router.use( '/api/v1/upgrade', new UpgradeRouter().getRouter() );

        app.use ( appConfig.requestPath || '', router );
        return app;
    };
}
