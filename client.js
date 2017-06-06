const request = require( 'request-promise' );
const Promise = require( 'bluebird' );
const argv = require( 'minimist' )( process.argv.slice( 2 ) )

const envName = argv[ 'ENVIRONMENT' ];
const stackName = argv[ 'STACK' ];
const serviceName = argv[ 'SERVICE' ];

const imageName = argv[ 'IMAGE' ];
const batchSize = argv[ 'BATCH_SIZE' ];
const interval = argv[ 'INTERVAL' ];
const startFirst = argv[ 'START_FIRST' ] == 'true'

const rancherAccessKey = process.env.RANCHER_ACCESS_KEY;
const rancherSecretKey = process.env.RANCHER_SECRET_KEY;
const apiEndpoint = process.env.API_ENDPOINT;

var upgradeEndpoint = apiEndpoint + '/upgrade';
var finishEndpoint = apiEndpoint + '/upgrade/finish';

function validateUpgradeData ( data ) {
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

function parseInfo( status ) {
    return {
        name: status.name,
        state: status.state,
        description: status.description,
        healthState: status.healthState,
        imageUuid: status.launchConfig ? status.launchConfig.imageUuid: undefined,
        scale: status.scale,
        startOnCreate: status.startOnCreate,
        transitioning: status.transitioning,
        transitioningMessage: status.transitioningMessage,
        transitioningProgress: status.transitioningProgress,
        upgrade: status.upgrade,
        uuid: status.uuid
    }
}

function requestUpgrade () {
    var options = {
        uri: upgradeEndpoint,
        auth: {
            user: rancherAccessKey,
            pass: rancherSecretKey
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        method: 'POST',
        body: {
            environment: envName,
            stack: stackName,
            service: serviceName,

            image: imageName,
            batchSize: batchSize,
            interval: interval,
            startFirst: startFirst
        },
        json: true
    };

    validateUpgradeData( options.body );

    return request( options );
}

function requestFinish ( serviceId ) {
    var options = {
        uri: finishEndpoint + '/' + serviceId,
        auth: {
            user: rancherAccessKey,
            pass: rancherSecretKey
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        method: 'POST',
        json: true
    };

    return request( options );
}

function tryFinish ( serviceId, n ) {
    return Promise.delay( 10000 )
        .then(() => {
            console.log( '\nChecking status...' );

            return requestFinish( serviceId );
        } )
        .then( status => {
            if ( status === 'ok' ) {
                return status;
            } else if ( n > 240 ) { // 240 times * 10s == 2400s == 40min
                
                console.log( 'Timeout expired.\nService info:' );
                console.log( status )

                return Promise.reject( new Error( 'Timeout expired.' ) );
            } else {

                console.log( 'Not finished.' );
                console.log( parseInfo( status ) );
                
                return tryFinish( serviceId, n + 1 );
            }
        } )
}

console.log( `Upgrading:\n - Service ${serviceName}\n - Stack ${stackName}\n - Environment: ${envName}\n - Image ${imageName}.` );

requestUpgrade()
    .then( service => {
        const serviceId = service.id;

        return tryFinish( serviceId, 0 );
    } )
    .then( result => {
        console.log( '\nFinished with success.' );

        process.exit( 0 );
    } )
    .catch( err => {
        console.log( err.message );

        process.exit( 1 );
    } );
