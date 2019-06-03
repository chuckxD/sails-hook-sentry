var Transport = require('winston-transport');
var util = require('util');
var sentryNode = require('@sentry/node');

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class SentryTransport extends Transport {
  constructor(settings) {
    super(settings);

    sentry = sentryNode.init({ dsn: settings.dsn, ...settings.options });
    //
    // Consume any custom options here. e.g.:
    // - Connection information for databases
    // - Authentication information for APIs (e.g. loggly, papertrail,
    //   logentries, etc.).
    //
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // Perform the writing to the remote service

    callback();
  }
};