#!/usr/bin/env node

const rancher = require( './build/services/rancher.service' );
const utf8 = require( 'utf8' );
const base64 = require( 'base-64' );
const Promise = require( 'bluebird' );
const argv = require( 'minimist' )( process.argv.slice( 2 ) );

const rancherService = new rancher.RancherService();

function tryFinish ( serviceId, auth, n ) {
    return Promise.delay( 10000 )
        .then( () => {
            console.log( '\nChecking status...' );

            return rancherService.finishUpgrade( serviceId, auth );
        } )
        .then( status => {
            if ( status === 'ok' ) {
                return status;
            } else if ( n > 60 ) { // 60 times * 10s == 600s == 10min

                console.log( 'Timeout expired.\nService info:' );
                console.log( status )

                return Promise.reject( new Error( 'Timeout expired.' ) );
            } else {

                console.log( 'Not finished.' );
                console.log( parseInfo( status ) );

                return tryFinish( serviceId, auth, n + 1 );
            }
        } )
}

function parseInfo ( status ) {
    return {
        name: status.name,
        state: status.state,
        description: status.description,
        healthState: status.healthState,
        imageUuid: status.launchConfig ? status.launchConfig.imageUuid : undefined,
        scale: status.scale,
        startOnCreate: status.startOnCreate,
        transitioning: status.transitioning,
        transitioningMessage: status.transitioningMessage,
        transitioningProgress: status.transitioningProgress,
        upgrade: status.upgrade,
        uuid: status.uuid
    }
}

function getData () {
    const envName = argv[ 'ENVIRONMENT' ];
    const stackName = argv[ 'STACK' ];
    const serviceName = argv[ 'SERVICE' ];
    const serviceId = argv[ 'SERVICE_ID' ];

    const imageName = argv[ 'IMAGE' ];
    const batchSize = argv[ 'BATCH_SIZE' ] || 1;
    const interval = argv[ 'INTERVAL' ] || 2000;
    const startFirst = ( argv[ 'START_FIRST' ] || 'true' ) == 'true'

    const data = {
        environment: envName,
        stack: stackName,
        service: serviceName,
        serviceId: serviceId,
        image: imageName,
        batchSize: batchSize,
        interval: interval,
        startFirst: startFirst
    };

    validateUpgradeData( data );

    return data;
}

function validateUpgradeData ( data ) {
    if ( !data.serviceId ) {
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
}

function getAuthorization () {
    const rancherAccessKey = process.env.RANCHER_ACCESS_KEY;
    const rancherSecretKey = process.env.RANCHER_SECRET_KEY;

    if ( !rancherAccessKey ) {
        throw new Error( 'Rancher Access Key is required..' );
    }
    if ( !rancherSecretKey ) {
        throw new Error( 'Rancher Secret Key is required.' );
    }

    const userPass = `${rancherAccessKey}:${rancherSecretKey}`;
    const bytes = utf8.encode( userPass );
    return `Basic ${base64.encode( bytes )}`;
}

const auth = getAuthorization();
const data = getData();

console.log( 'Upgrading:\n', data );

rancherService.upgradeService( data, auth )
    .then( service => {
        const serviceId = service.id;

        return tryFinish( serviceId, auth, 0 );
    } )
    .then( result => {
        console.log( '\nFinished with success.' );

        process.exit( 0 );
    } )
    .catch( err => {
        console.log( err.message );

        process.exit( 1 );
    } );
