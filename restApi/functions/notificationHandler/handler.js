'use strict';

// Includes
const lib = require('../../lib/index').default();
const HipChatAPI = require('../../lib/hipchat_api').HipChatAPI;
const validateJWT = require('../../lib/jwt').validateJWT;
const notificationHandler = require('../../lib/sns_notification_manager').notificationHandler;

const toStringIfBuffer = event => Buffer.isBuffer(event) ? JSON.parse(event.toString()) : event;

/**
* Slight discrepancy between the data returned by 'serverless-plugin-sns' and that
* returned by an HTTPS subscription in SNS console. Supporting both so that in
* local development, users can subscribe manually without having to update this code
*/
const getSNSNotificationsFromEvent = event => {
  const extractedEventData = toStringIfBuffer(event);
  let snsNotifications = [];
  if (typeof extractedEventData.Records !== 'undefined') {
    snsNotifications = extractedEventData.Records.map(record => record.Sns);
  } else {
    snsNotifications.push(extractedEventData);
  }

  return snsNotifications;
};

exports.handler = function(event, context, cb) {
  const notifications = getSNSNotificationsFromEvent(event);
  lib.logger.info('notifications', JSON.stringify(notifications));
  Promise.all(notifications.map(notification => notificationHandler(lib, notification)))
    .then(
      result => cb(null, { message: 'notificationHandler stored SNS notifications successfully' }),
      err => cb(err)
    );
};
