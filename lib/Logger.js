var VERBOSE = !!process.env.VERBOSE;
var DEBUG = !!process.env.DEBUG;

function Logger(context) {
  var logger = {};
  var loggingContext = context + ':';

  var logLevels = [ 'log', 'info', 'warn', 'error' ];

  logLevels.forEach(function(logLevel) {
    logger[logLevel] = function() {
      if (!VERBOSE && logLevels.indexOf(logLevel) < 2) {
        return;
      }

      var args = [].slice.call(arguments);
      args[0] = '[' + logLevel + '] ' + loggingContext + ' ' + args[0];
      console[logLevel].apply(console, args);
    };
  });

  logger.debug = function() {
    if (DEBUG) {
      var args = [].slice.call(arguments);
      args[0] = '[DEBUG] ' + loggingContext + ' ' + args[0];
      console.log.apply(console, args);
    }
  };

  return logger;
};

Logger.setVerbose = function(onOrOff) {
  VERBOSE = onOrOff;
};

Logger.setDebug = function(onOrOff) {
  DEBUG = onOrOff;
};

module.exports = Logger;