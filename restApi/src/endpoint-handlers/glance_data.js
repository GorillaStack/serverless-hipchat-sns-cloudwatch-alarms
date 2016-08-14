'use strict';

import { getTopicGroupState, getGlanceFormattedTopicGroupState } from '../topic_group_manager';

const handler = (lib, hipchat, event, oauthData) => {
  return new Promise((resolve, reject) => {
    try {
      lib.logger.debug('In /glance-data handler');
      lib.logger.debug(event);
      getTopicGroupState(lib, event.query.id).then(
        currentState =>
          resolve(getGlanceFormattedTopicGroupState(lib, event.query.id, currentState)),
        reject);
    } catch (e) {
      reject(e);
    }
  });
};

export { handler };
