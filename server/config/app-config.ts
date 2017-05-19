/**
 * This class have all application config
 */
export class AppConfig {

    public get isProd(): boolean {
        return ( this.getEnv( 'NODE_ENV' ) === 'production' );
    }

    public get requestPath(): string {
        return this.getEnv( 'REQUEST_PATH' );
    }

    private getEnv ( key: string ): string {
        if ( !process.env[ key ] ) {
            
            console.warn( `a variável ${key} não foi definida` );
            
            return undefined;
        } else {
            return process.env[ key ];
        }
    }

}
