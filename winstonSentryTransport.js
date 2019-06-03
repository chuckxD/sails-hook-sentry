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

    this.sentry = sentryNode.init({ dsn: settings.dsn, ...settings.options });
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    try {
      this.sentry.captureException(info, extra, function() {
        callback(null, true);
      });
    } catch(err) {
      console.error(err);
    }

    callback();
  }
};