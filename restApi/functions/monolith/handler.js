'use strict';

// Includes
const lib = require('../../lib/index').default();
const HipChatAPI = require('../../lib/hipchat_api').default;
const validateJWT = require('../../lib/jwt').default;

// Include endpoint handlers
const endpointHandlersIndex = require('../../lib/endpoint-handlers/index');
const endpointHandlers = endpointHandlersIndex.endpointHandlers;
const jwtEndpoints = endpointHandlersIndex.jwtEndpoints;

const handleError = (err, cb) => {
  lib.logger.error('Uncaught error', err);
  cb(err);
};

const applyJWTValidationIfRequired = (endpoint, event) => {
  if (jwtEndpoints.indexOf(endpoint) > -1) {
    lib.logger.log('debug', 'Endpoint "%s" does require JWT validation', endpoint);
    return validateJWT(event, lib);
  } else {
    lib.logger.debug('Endpoint "%s" does not require JWT validation', endpoint);
    return {
      then: function (resolve) {
        resolve();
      }
    };
  }
};

const callEndpointHandler = (endpoint, args) => {
  if (endpointHandlers && endpointHandlers[endpoint]) {
    let handler = endpointHandlers[endpoint];
    lib.logger.debug('Found handler');
    return handler.apply(this, args);
  } else {
    lib.logger.debug('Could not find handler');
    throw new Error('No handler found for endpoint ' + endpoint);
  }
};

/**
* Deal with cases where event params, query params and headers come through escaped
* Caused by discrepancy between behaviour of API Gateway and the serverless-offline
* plugin
*/
const guaranteeEventJSON = event => {
  const eventJSON = {};
  const keysToCheck = ['headers', 'params', 'query'];
  Object.keys(event).forEach(key => {
    if (keysToCheck.indexOf(key) > -1 && typeof event[key] === 'string') {
      eventJSON[key] = JSON.parse(event[key]);
    } else {
      eventJSON[key] = event[key];
    }
  });

  return eventJSON;
};

exports.handler = function (event, context, cb) {
  const endpoint = event.path;
  lib.logger.info('Handling endpoint: ', endpoint);
  lib.logger.debug('Event json:', JSON.stringify(event));
  const eventJSON = guaranteeEventJSON(event);

  const hipchat = new HipChatAPI(lib.dbManager, lib.logger);

  applyJWTValidationIfRequired(endpoint, eventJSON).then(
    oauthData => callEndpointHandler(endpoint, [lib, hipchat, eventJSON, oauthData]).then(
      res => cb(null, res),
      err => handleError(err, cb)
    ),

    err => handleError(err, cb)
  );
};
