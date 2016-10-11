
/**
* sns_notification_manager
*
* code used to process incoming sns notifications
*/

import co from 'co';
import { getGlanceFormattedTopicGroupState, getTopicGroupState } from './topic_group_manager';
import HipChatAPI from './hipchat_api';

const GLANCE_PREFIX = 'glance.';

const notificationHandler = (lib, notification) => {
  const alarm = JSON.parse(notification.Message);
  const topicName = getTopicNameFromNotification(notification);
  lib.logger.info('Topic ' + topicName + ' received CloudWatch Alarm: ', { alarm: alarm });
  const topicGroups = getTopicGroupsToUpdate(topicName, lib.config.topicGroups);
  lib.logger.debug('Topic Groups to update: ', { topicGroups: topicGroups });
  return co(function*() {
    yield storeAlarmState(lib, topicGroups, topicName, alarm);
    const queryResult = yield lib.dbManager.scan(process.env.INSTALLATION_TABLE);
    const installations = queryResult.Items;
    for (const installation of installations) {
      let hipchat = new HipChatAPI(lib.dbManager, lib.logger);
      for (const topicGroup of topicGroups) {
        const currentState = yield getTopicGroupState(lib, topicGroup);
        const glanceData = getGlanceFormattedTopicGroupState(lib, topicGroup, currentState);
        const glanceKey = GLANCE_PREFIX.concat(topicGroup);
        yield hipchat.updateGlanceData(installation.oauthId, installation.roomId, glanceKey, glanceData);
      }
    }
  });
};

const getTopicNameFromNotification = notification => {
  return notification.TopicArn.split(':').slice(-1)[0];
};

const getTopicGroupsToUpdate = (topicName, topicGroups) => {
  return Object.keys(topicGroups).filter(key => {
    return topicGroups[key].topics.indexOf(topicName) > -1;
  });
};

/**
* storeAlarmState
*
* Store the alarm for each topic group.
* Even if duplicates, this accomodates scenarios where one alarm publishes multiple
* topics.
*/
const storeAlarmState = (lib, topicGroups, topicName, alarm) => {
  return co(function*() {
    for (const topicGroupKey of topicGroups) {
      yield lib.dbManager.put(process.env.ALARM_TABLE, {
        alarmName: alarm.AlarmName,
        topicGroupKey: topicGroupKey,
        topicName: topicName,
        alarm: alarm
      });
    }
  });
};

export { notificationHandler, getTopicNameFromNotification, getTopicGroupsToUpdate };
