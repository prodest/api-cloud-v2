/**
 * This class have all application configs
 */
export class AppConfig {

    public static get isProd (): boolean {
        return ( this.getEnv( 'NODE_ENV' ) === 'production' );
    }

    public static get requestPath (): string {
        return this.getEnv( 'REQUEST_PATH' ) || '';
    }

    public static get rancherURL (): string {
        return this.getEnv( [ 'RANCHER_URL', 'CATTLE_URL', 'TARGET_URL' ] );
    }

    private static getEnv ( keys: string[] | string ): string {
        keys = [].concat( keys );
        let errors = 'Alguma das variáveis a seguir deve ser definida: ';

        for ( const i in keys ) {
            const k = keys[ i ];
            if ( !process.env[ k ] ) {
                errors += `${k} `;
            } else {
                return process.env[ k ];
            }
        }

        console.warn( errors );
        return undefined;
    }
}
