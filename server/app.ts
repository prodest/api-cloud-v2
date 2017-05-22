import * as dotenv from 'dotenv';
dotenv.config();
import * as compression from 'compression';
import { Request, Response } from 'express';
import * as express from 'express';
import * as morgan from 'morgan';
import { AppConfig } from './config';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

/**
 * importacao das rotas
 */
import * as routes from './routes';

class MainApp {

  public app: express.Application;
  private config: AppConfig;

  constructor() {
    this.app = express();
    this.config = new AppConfig();

    this.handleParsers();

    this.app.use( morgan( 'dev' ) );

    this.app.use( cors() );

    routes.main.callRoutes( this.app, this.config );

    this.handleError();
  }

  private handleParsers () {
    this.app.use( compression() );
    this.app.use( bodyParser.json() );
    this.app.use( bodyParser.urlencoded( { extended: false } ) );
  }

  private handleError () {
    // error handlers

    // development error handler
    // will print stacktrace
    if ( this.app.get( 'env' ) === 'development' ) {
      this.app.use( function ( err: any, req: Request, res: Response, next: Function ) {
        console.error( err );
        res.status( err.statusCode || 500 ).json( { error: err.message, stack: err.stack } );
      } );
    }

    // production error handler
    // no stacktraces leaked to user
    this.app.use(( err: any, req: Request, res: Response, next: Function ) => {
      console.error( err );
      res.status( err.statusCode || 500 ).json( { error: err.message } );
    } );
    return this.app;
  }

}

/**
 * para enviar a aplicacao a nivel do server será sempre levado o objeto app criado ao instanciar a aplicacao
 */
export let application = ( new MainApp() ).app;
