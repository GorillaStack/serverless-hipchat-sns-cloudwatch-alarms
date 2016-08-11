
/**
* sns_notification_manager
*
* code used to process incoming sns notifications
*/

import co from 'co';
import { getGlanceFormattedTopicGroupState } from './topic_group_manager';

const notificationHandler = (lib, notification) => {
  const alarm = JSON.parse(notification.Message);
  const topicName = getTopicNameFromNotification(notification);
  lib.logger.info('Topic ' + topicName + ' received CloudWatch Alarm: ', { alarm: alarm });
  const topicGroups = getTopicGroupsToUpdate(topicName, lib.config.topicGroups);
  lib.logger.debug('Topic Groups to update: ', { topicGroups: topicGroups });
  const currentState = getAlarmState(alarm);
  return co(function*() {
    const queryResult = yield lib.dbManager.query(process.env.INSTALLATION_TABLE);
    const installations = queryResult.Items;
    lib.logger.debug('installations: ', installations);

    // let hipchat = new HipChatAPI(lib.dbManager, lib.logger);
    // topicGroups.forEach(topicGroup => {
    //   const glanceData = getGlanceFormattedTopicGroupState(lib, topicGroup, currentState);
    //   yield hipchat.updateGlanceData(oauthId, roomId, 'glance.' + topicGroup, glanceData);
    // });
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

const getAlarmState = alarm => alarm.NewStateValue;

export { notificationHandler, getTopicNameFromNotification, getTopicGroupsToUpdate };
