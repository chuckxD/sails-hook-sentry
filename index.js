const { createLogger } = require('winston');
const WinstonSentryTransport = require('./winstonSentryTransport');

module.exports = function Sentry(sails) {
  return {
    /**
     * Default configuration
     *
     * We do this in a function since the configuration key for
     * the hook is itself configurable, so we can't just return
     * an object.
     */

    configure: function() {
      var settings = sails.config[this.configKey];
      if (!settings.active) {
        sails.log.info('Autoreload hook deactivated.');
        return cb();
      }

      if (!settings.dsn) {
        sails.log.info('DSN for Sentry is required.');
        return cb();
      }

      var winstonSentryTransport = new WinstonSentryTransport(settings);
      sails.sentry = winstonSentryTransport.sentry;

      var logger = createLogger({
        transports: [
          winstonSentryTransport
        ],
        level: 'error'
      });

      sails.config.log = {
        level: 'error',
        custom: logger,
        inspect: false
      };
    },

    defaults: {
      __configKey__: {
        // Set autoreload to be active by default
        active: true,
        dsn: null,
        options: {}
      }
    },

    /**
     * Initialize the hook
     * @param  {Function} cb Callback for when we're done initializing
     * @return {Function} cb Callback for when we're done initializing
     */
    initialize: function(cb) {
      // handles Bluebird's promises unhandled rejections
      process.on('unhandledRejection', function(reason) {
        console.error('Unhandled rejection:', reason);
        sails.sentry.captureException(reason);
      });

      // We're done initializing.
      return cb();
    }
  };
};
