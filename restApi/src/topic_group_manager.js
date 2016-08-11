/**
* topic_group_manager
*
* code for:
*   1. set/get data on topics
*   2. format topic group data for glances in the hipchat connect api
*   3. format topic group data for sidebar for individual glances
*/
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

  ERROR: {
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

export { setTopicData, getTopicData, getGlanceFormattedTopicGroupState };
