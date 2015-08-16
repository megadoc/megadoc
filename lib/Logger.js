var VERBOSE = !!process.env.VERBOSE;

module.exports = function(context) {
  var logger = {};
  var loggingContext = context + ':';

  var logLevels = [ 'log', 'info', 'warn', 'error' ];

  logLevels.forEach(function(logLevel) {
    logger[logLevel] = function() {
      if (!VERBOSE && logLevels.indexOf(logLevel) < 2) {
        return;
      }

      var args = [].slice.call(arguments);
      args[0] = loggingContext + ' ' + args[0];
      console[logLevel].apply(console, args);
    };
  });

  return logger;
};