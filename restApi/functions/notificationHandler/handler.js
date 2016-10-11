'use strict';

// Includes
const lib = require('../../lib/index').default();
const HipChatAPI = require('../../lib/hipchat_api').HipChatAPI;
const validateJWT = require('../../lib/jwt').validateJWT;
const notificationHandler = require('../../lib/sns_notification_manager').notificationHandler;

exports.handler = function(event, context, cb) {
  const eventData = JSON.parse(event.toString());
  lib.logger.debug('eventData: ', eventData);
  notificationHandler(lib, eventData).then(
    result => cb(null, { message: 'Go Serverless! Your Lambda function executed successfully!' }),
    err => cb(err)
  );
};
