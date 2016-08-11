'use strict';

import { getGlanceFormattedTopicGroupState } from '../topic_group_manager';

const handler = (lib, hipchat, event, oauthData) => {
  return new Promise((resolve, reject) => {
    try {
      lib.logger.debug('In /glance-data handler');
      lib.logger.debug(event);
      resolve(getGlanceFormattedTopicGroupState(lib, event.query.id));
    } catch (e) {
      reject(e);
    }
  });
};

export { handler };
