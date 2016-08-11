'use strict';

// Includes
const lib = require('../../lib/index').default();
const HipChatAPI = require('../../lib/hipchat_api').HipChatAPI;
const validateJWT = require('../../lib/jwt').validateJWT;
const handleNotification = require('../../lib/sns_notification_manager').handleNotification;

exports.handler = function(event, context, cb) {
  lib.logger.debug('Event json:', JSON.stringify(event));
  const eventData = event.toString();
  lib.logger.debug('Event data:', eventData);
  const hipchat = new HipChatAPI(lib.dbManager, lib.logger);

  handleNotification(hipchat, data).then(
    result => cb(null, { message: 'Go Serverless! Your Lambda function executed successfully!' }),
    err => cb(err)
  );
};
