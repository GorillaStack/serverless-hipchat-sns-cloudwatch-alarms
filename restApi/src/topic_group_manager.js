/**
* topic_group_manager
*
* code for:
*   1. set/get data on topics
*   2. format topic group data for glances in the hipchat connect api
*   3. format topic group data for sidebar for individual glances
*/

const EMPTY_STATE = 'EMPTY';
const ALARM_STATE = 'ALARM';
const INSUFFICIENT_DATA_STATE = 'INSUFFICIENT_DATA';
const OK_STATE = 'OK';

const LOZENGES = {
  OK: {
    type: 'lozenge',
    value: {
      label: 'All OK',
      type: 'success',
    },
  },

  INSUFFICIENT_DATA: {
    type: 'lozenge',
    value: {
      label: 'Insufficient Data',
      type: 'current',
    },
  },

  ALARM: {
    type: 'lozenge',
    value: {
      label: 'Alarm',
      type: 'error',
    },
  },

  EMPTY: {
    type: 'lozenge',
    value: {
      label: 'No Data',
      type: 'default',
    },
  },
};


const setTopicData = () => {};

const getTopicData = () => {};

/**
* getGlanceFormattedTopicGroupState
*
* Get the formatted glance payload data for this topicGroup
* @param lib        - {Object} - loaded library code
* @param topicGroup - {String} - topic group name
* @param state      - {String} - (optional) - current state to report
*/
const getGlanceFormattedTopicGroupState = (lib, topicGroup, state = 'OK') => {
  const topicGroupConfig = lib.config.topicGroups[topicGroup] || {};
  const glanceData = {
    label: {
      value: `<b>${(topicGroupConfig.name || topicGroup)}</b>`,
      type: 'html',
    },
    status: LOZENGES[state],
  };

  return glanceData;
};

const getSummaryStateForAlarms = (lib, alarms) => {
  const someError = alarms.some(alarm => alarm.NewStateValue === ALARM_STATE);
  const someInsufficientData = alarms
    .some(alarm => alarm.NewStateValue === INSUFFICIENT_DATA_STATE);
  if (alarms.length === 0) {
    return EMPTY_STATE;
  } else if (someError) {
    return ALARM_STATE;
  } else if (someInsufficientData) {
    return INSUFFICIENT_DATA_STATE;
  }

  return OK_STATE;
};

const getTopicGroupState = (lib, topicGroupKey) => new Promise((resolve, reject) => {
  lib.dbManager.query(process.env.ALARM_TABLE, 'topicGroupKey', topicGroupKey)
    .then(
      res => {
        lib.logger.debug('Received results for getTopicGroupState', { results: res });
        resolve(getSummaryStateForAlarms(lib, res.Items.map(alarmEntry => alarmEntry.alarm)));
      },

      err => {
        lib.logger.error('getTopicGroupState received error', {
          err: err.toString(),
          stack: err.stack,
        });
        reject(err);
      }
    );
});

export {
  setTopicData,
  getTopicData,
  getGlanceFormattedTopicGroupState,
  getTopicGroupState,
  getSummaryStateForAlarms,
};
