const { createLogger, format } = require('winston');
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
      if (settings.dsn && settings.active) {

        var winstonSentryTransport = new WinstonSentryTransport(settings);
        sails.sentry = winstonSentryTransport.sentry;

        var logger = createLogger({
          format: format.combine(
            format.splat(),
            format.simple()
          ),
          transports: [
            winstonSentryTransport
          ],
          level: sails.config.log.level
        });

        const levels = {};
        Object.keys(sails.log).map((level, i) => {
          levels[level] = i;
        });

        var logHelper = {
          log: logger.info.bind(logger)
        };

        sails.config.log = {
          levels,
          level: sails.config.log.level,
          custom: logHelper,
          inspect: false
        };
      } else {
        console.info('Sentry not enabled! DSN not defined, or has been inactivated.');
      }
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
        if (sails.sentry) {
          sails.sentry.captureException(reason);
        }
      });

      // We're done initializing.
      return cb();
    }
  };
};
