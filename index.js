module.exports = function Sentry(sails) {
  return {
    /**
     * Default configuration
     *
     * We do this in a function since the configuration key for
     * the hook is itself configurable, so we can't just return
     * an object.
     */
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
      var settings = sails.config[this.configKey];
      if (!settings.active) {
        sails.log.info('Autoreload hook deactivated.');
        return cb();
      }

      if (!settings.dsn) {
        sails.log.info('DSN for Sentry is required.');
        return cb();
      }

      const Sentry = require('@sentry/node');
      Sentry.init({ dsn: settings.dsn, ...settings.options });

      sails.sentry = Sentry;

      sails.config.log = {
        level: 'error',
        custom: sails.sentry.captureException,
        inspect: false
      };

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
