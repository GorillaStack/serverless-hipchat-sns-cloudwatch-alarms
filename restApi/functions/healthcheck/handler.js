'use strict';

import lib from '../../lib';

const handler = (event, context, cb) => {
  lib.logger.log('debug', 'In healthcheck handler');
  return cb(null, {
    message: 'Go Serverless! Your Lambda function executed successfully!'
  });
};

export {handler};
