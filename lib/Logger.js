var LEVEL = 'log';

function Logger(context) {
  var logger = {};
  var loggingContext = context + ':';

  var logLevels = [ 'debug', 'info', 'log', 'warn', 'error' ];

  logLevels.forEach(function(logLevel) {
    logger[logLevel] = function() {
      var args;

      if (logLevels.indexOf(logLevel) < logLevels.indexOf(LEVEL)) {
        return;
      }

      args = [].slice.call(arguments);
      args[0] = '[' + logLevel + '] ' + loggingContext + ' ' + args[0];

      (console[logLevel] || console.log).apply(console, args);
    };
  });

  logger.assert = console.assert.bind(console);
  logger.raw = console;

  return logger;
}

Logger.setVerbose = function() {
  LEVEL = 'info';
};

Logger.setDebug = function() {
  LEVEL = 'debug';
};

Logger.setLevel = function(level) {
  LEVEL = level;
};

if (process.env.DEBUG === '1') {
  Logger.setDebug();
}

module.exports = Logger;