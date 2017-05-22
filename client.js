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

function requestUpgrade () {
    var options = {
        uri: upgradeEndpoint,
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

    return request( options );
}

function requestFinish ( serviceId ) {
    var options = {
        uri: finishEndpoint + '/' + serviceId,
        headers: {
            'User-Agent': 'Request-Promise'
        },
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
            return Promise.reject( status );
        } else {
            console.log( status );
            return tryFinish( serviceId, n + 1 );
        }
    } )
}

requestUpgrade()
.then( service => {
    const serviceId = service.id;

    return tryFinish( serviceId, 0 );
} )
.then( result => {
    console.log( '\n\nFinished with success.' );

    process.exit( 0 );
} )
.catch( err => {
    console.log( err );

    process.exit( 1 );
} );
