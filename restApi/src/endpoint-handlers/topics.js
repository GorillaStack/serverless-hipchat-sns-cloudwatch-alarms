'use strict';

const handler = (lib, hipchat, event, oauthData) => {
  return new Promise((resolve, reject) => {
    try {
      lib.logger.log('debug', 'In /topics handler');

      process.nextTick(() =>
        resolve({
          status: 'success',
          topics: [
            { title: 'Topic 1', alerts: [{}, {}], status: 'OK' },
            { title: 'Topic 2', alerts: [{}], status: 'INSUFFICIENT_DATA' },
            { title: 'Topic 3', alerts: [{}, {}, {}], status: 'ALERT' }
          ]
        }));
      // hipchat.updateGlanceData(oauthData.oauthId, oauthData.roomId, 'sample.glance', glanceData).then(
      //   () => resolve(),
      //   (err) => {
      //     lib.logger.log('error', 'Could not run /update-glance handler', err);
      //     reject(err);
      //   }
      // );
    } catch (err) {
      reject(err);
    }
  });
};

export { handler };
