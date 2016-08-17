'use strict';

import { getSummaryStateForAlarms } from '../topic_group_manager';

const handler = (lib, hipchat, event, oauthData) => {
  return new Promise((resolve, reject) => {
    try {
      lib.logger.debug('In /topics handler');
      lib.logger.debug('topicGroupKey: ' + JSON.stringify(event));
      lib.dbManager.query(process.env.ALARM_TABLE, 'topicGroupKey', event.body.topicGroupKey)
        .then(result => {
          lib.logger.debug('result.Items', { data: JSON.stringify(result.Items) });
          const alertsByTopic = getAlarmsByTopic(lib, result.Items);

          resolve({
            status: 'success',
            topics: alertsByTopic
          });
        }, err => {
          lib.logger.error('Could not retrieve alarms for topicGroupKey: ' + event.body.topicGroupKey,
            { msg: err.toString(), stack: err.stack });
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};

const getAlarmsByTopic = (lib, alerts) => {
  let topics = {};
  alerts.forEach(entry => {
    if (typeof topics[entry.topicGroupKey] === 'undefined') {
      topics[entry.topicGroupKey] = [];
    }

    topics[entry.topicGroupKey].push(entry.alarm);
  });

  return Object.keys(topics).map(key => {
    return {
      title: lib.config.topicGroups[key].name,
      alarms: topics[key],
      status: getSummaryStateForAlarms(lib, topics[key])
    };
  });
};

export { handler };
