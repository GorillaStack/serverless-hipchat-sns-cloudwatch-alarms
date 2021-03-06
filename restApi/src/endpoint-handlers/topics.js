import { getSummaryStateForAlarms } from '../topic_group_manager';

const getAlarmsByTopic = (lib, alarms) => {
  const topics = {};
  alarms.forEach(entry => {
    if (typeof topics[entry.topicName] === 'undefined') {
      topics[entry.topicName] = [];
    }

    topics[entry.topicName].push(entry.alarm);
  });

  return Object.keys(topics).map(key => ({
    title: key,
    alarms: topics[key],
    status: getSummaryStateForAlarms(lib, topics[key]),
  }));
};

const handler = (lib, hipchat, event) => new Promise((resolve, reject) => {
  try {
    lib.logger.debug('In /topics handler');
    lib.logger.debug(`topicGroupKey: ${JSON.stringify(event)}`);
    lib.dbManager.query(process.env.ALARM_TABLE, 'topicGroupKey', event.body.topicGroupKey)
      .then(result => {
        lib.logger.debug('result.Items', { data: JSON.stringify(result.Items) });
        const alarmsByTopic = getAlarmsByTopic(lib, result.Items);
        resolve({
          status: 'success',
          topics: alarmsByTopic,
        });
      }, err => {
        lib.logger.error(`Could not retrieve alarms for topicGroupKey: ${event.body.topicGroupKey}`,
          { msg: err.toString(), stack: err.stack });
        reject(err);
      });
  } catch (err) {
    reject(err);
  }
});

export default handler;
