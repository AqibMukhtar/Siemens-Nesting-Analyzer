const winston = require('winston');

winston
  .add(new winston.transports.Console())
  .add(
    new winston.transports.File({
      filename: 'logs/errors.log',
      level: 'warn'
    })
  );

module.exports = winston;