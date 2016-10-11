const getLozengeStyleForStatus = status => {
  if (status === 'OK') {
    return 'lozenge-success';
  } else if (status === 'INSUFFICIENT_DATA') {
    return 'lozenge-current';
  } else if (status === 'ALARM') {
    return 'lozenge-error';
  }

  return 'lozenge-current';
};

const formatMessageForAlarm = (alarm, user) => ({
  color: 'gray',
  // this is a backup message for HipChat clients that do not understand cards
  // (old HipChat clients, 3rd party XMPP clients)
  message: `Alarm being escalated: ${JSON.stringify(alarm)}`,
  message_format: 'text',
  card: {
    style: 'application',
    id: 'some_id',
    format: 'medium',
    title: `CloudWatch Alarm escalated by ${user}`,
    description: alarm.NewStateReason,
    attributes: [
      {
        label: 'Alarm Name',
        value: {
          label: alarm.AlarmName,
        },
      },
      {
        label: 'Alarm Description',
        value: {
          label: alarm.AlarmDescription,
        },
      },
      {
        label: 'Previous State',
        value: {
          label: alarm.OldStateValue,
          style: getLozengeStyleForStatus(alarm.OldStateValue),
        },
      },
      {
        label: 'Current State',
        value: {
          label: alarm.NewStateValue,
          style: getLozengeStyleForStatus(alarm.NewStateValue),
        },
      },
    ],
  },
});

const handler = (lib, hipchat, event, oauthData) => new Promise((resolve, reject) => {
  try {
    lib.logger.debug('In /post-card handler');

    lib.logger.debug('requrest body for card', event.body);
    const message = formatMessageForAlarm(event.body.alarm, event.body.user);
    hipchat.sendMessage(oauthData.oauthId, oauthData.roomId, message).then(
      res => resolve(res),
      err => {
        lib.logger.error('Could not run /post-card handler', err);
        reject(err);
      }
    );
  } catch (err) {
    reject(err);
  }
});


export default handler;
