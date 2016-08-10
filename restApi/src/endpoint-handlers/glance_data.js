'use strict';

const handler = (lib, hipchat, event, oauthData) => {
  return new Promise((resolve, reject) => {
    try {
      lib.logger.debug('In /glance-data handler');
      lib.logger.debug(event);
      const topicGroup = lib.config.topicGroups[event.query.id] || {};

      const glanceData = {
        label: {
          value: '<b>' + (topicGroup.name || event.query.id) + '</b>',
          type: 'html'
        },
        status: {
          type: 'lozenge',
          value: {
              label: 'All OK',
              type: 'success'
          }
        }
      };

      resolve(glanceData);
    } catch (e) {
      reject(e);
    }
  });
};

export { handler };
