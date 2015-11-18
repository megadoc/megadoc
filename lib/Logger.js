var LEVEL = 'log';
var LEVELS = [ 'info', 'log', 'warn', 'error' ];

function Logger(context) {
  var logger = {};
  var loggingContext = context + ':';

  LEVELS.forEach(function(logLevel) {
    logger[logLevel] = function() {
      var args;

      if (LEVELS.indexOf(logLevel) < LEVELS.indexOf(LEVEL)) {
        return;
      }

      args = [].slice.call(arguments);
      args[0] = '[' + logLevel + '] ' + loggingContext + ' ' + args[0];

      console[logLevel].apply(console, args);
    };
  });

  logger.assert = console.assert.bind(console);
  logger.raw = console;

  return logger;
}

Logger.setVerbose = function() {
  LEVEL = 'info';
};

Logger.setLevel = function(level) {
  LEVEL = level;
};

if (process.env.VERBOSE) {
  Logger.setVerbose();
}

module.exports = Logger;