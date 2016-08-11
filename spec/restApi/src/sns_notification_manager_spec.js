/**
* sns_notification_manager_spec.js
*
* This sns_notification_manager is designed to process sns notifications
*/

import { getTopicGroupsToUpdate, getTopicNameFromNotification } from '../../../restApi/src/sns_notification_manager';

describe('sns_notification_manager.js', () => {
  const sampleNotification = {
    Type: 'Notification',
    MessageId: 'f52053e9-4a2e-5999-a1d0-03ccbe3d333c',
    TopicArn: 'arn:aws:sns:us-east-1:123456789012:SampleTopic1',
    Subject: 'INSUFFICIENT_DATA: \"SNS-SLS-Alarm1\" in US East - N. Virginia',
    Message: '{\"AlarmName\":\"SNS-SLS-Alarm1\",\"AlarmDescription\":\"Dummy Alarm 1\",\"AWSAccountId\":\"123456789012\",\"NewStateValue\":\"INSUFFICIENT_DATA\",\"NewStateReason\":\"Insufficient Data: 3 datapoints were unknown.\",\"StateChangeTime\":\"2016-08-11T03:32:35.566+0000\",\"Region\":\"US East - N. Virginia\",\"OldStateValue\":\"OK\",\"Trigger\":{\"MetricName\":\"CPUUtilization\",\"Namespace\":\"AWS/EC2\",\"Statistic\":\"AVERAGE\",\"Unit\":null,\"Dimensions\":[{\"name\":\"InstanceId\",\"value\":\"i-070eff4d012a407de\"}],\"Period\":60,\"EvaluationPeriods\":3,\"ComparisonOperator\":\"GreaterThanThreshold\",\"Threshold\":90.0}}',
    Timestamp: '2016-08-11T03:32:35.615Z'
  };

  describe('getTopicNameFromNotification', () => {

    it('is defined', () =>
      expect(getTopicGroupsToUpdate).not.toBeUndefined());

    it('is a function', () =>
      expect(typeof getTopicGroupsToUpdate).toBe('function'));

    describe('can decontruct an ARN to retrieve the correct topic name', () => {
      let result = null;

      beforeAll(() => {
        result = getTopicNameFromNotification(sampleNotification);
      });

      it('which is "SampleTopic1"', () =>
        expect(result).toBe('SampleTopic1'));

    });
  });

  describe('getTopicGroupsToUpdate', () => {

    it('is defined', () =>
      expect(getTopicGroupsToUpdate).not.toBeUndefined());

    it('is a function', () =>
      expect(typeof getTopicGroupsToUpdate).toBe('function'));

    describe('when called ', () => {
      const topicGroups = {
        alpha: {
          name: 'Application Alpha',
          topics: [
            'SampleTopic1'
          ]
        },
        beta: {
          name: 'Application Beta',
          topics: [
            'SampleTopic2',
            'SampleTopic3'
          ]
        },
        gamma: {
          name: 'Application Gamma',
          topics: [
            'SampleTopic3',
            'SampleTopic1'
          ]
        }
      };

      it('returns an array of one topic group name if each containing the topicName', () =>
        expect(getTopicGroupsToUpdate('SampleTopic2', topicGroups)).toEqual(['beta']));

      it('returns more than one topic group names if each containing the topicName', () =>
        expect(getTopicGroupsToUpdate('SampleTopic1', topicGroups)).toEqual(['alpha', 'gamma']));

    });
  });
});
