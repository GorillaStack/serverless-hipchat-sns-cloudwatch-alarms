/**
* topic_group_manager
*
* code for:
*   1. set/get data on topics
*   2. format topic group data for glances in the hipchat connect api
*   3. format topic group data for sidebar for individual glances
*/

const ALARM_STATE = 'ALARM';
const INSUFFICIENT_DATA_STATE = 'INSUFFICIENT_DATA';
const OK_STATE = 'OK';

const LOZENGES = {
  OK: {
    type: 'lozenge',
    value: {
      label: 'All OK',
      type: 'success'
    }
  },

  INSUFFICIENT_DATA: {
    type: 'lozenge',
    value: {
      label: 'Insufficient Data',
      type: 'current'
    }
  },

  ALARM: {
    type: 'lozenge',
    value: {
      label: 'Error',
      type: 'error'
    }
  }
};


const setTopicData = (lib, topicGroup, data) => {
};

const getTopicData = (lib, topicGroup) => {};

/**
* getGlanceFormattedTopicGroupState
*
* Get the formatted glance payload data for this topicGroup
* @param lib        - {Object} - loaded library code
* @param topicGroup - {String} - topic group name
* @param state      - {String} - (optional) - current state to report
*/
const getGlanceFormattedTopicGroupState = (lib, topicGroup, state) => {
  state = state || 'OK';
  const topicGroupConfig = lib.config.topicGroups[topicGroup] || {};
  const glanceData = {
    label: {
      value: '<b>' + (topicGroupConfig.name || topicGroup) + '</b>',
      type: 'html'
    },
    status: LOZENGES[state]
  };

  return glanceData;
};

const getTopicGroupState = (lib, topicGroupKey) => {
  return new Promise((resolve, reject) => {
    lib.dbManager.query(process.env.ALARM_TABLE, 'topicGroupKey', topicGroupKey)
      .then(
        res => {
          lib.logger.debug('Received results for getTopicGroupState', { results: res });
          const someError = res.Items.every(item => item.alarm.NewStateValue === ALARM_STATE);
          const someInsufficientData = res.Items.every(item => item.alarm.NewStateValue === INSUFFICIENT_DATA_STATE);
          if (someError) {
            resolve(ALARM_STATE);
          } else if (someInsufficientData) {
            resolve(INSUFFICIENT_DATA_STATE);
          } else {
            resolve(OK_STATE);
          }
        },

        err => {
          lib.logger.error('getTopicGroupState received error', { err: err.toString(), stack: err.stack });
          reject(err);
        }
      );
  });
};

export { setTopicData, getTopicData, getGlanceFormattedTopicGroupState, getTopicGroupState };
