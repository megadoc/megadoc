var console = new require('./Logger')('tinydoc');
var scan = function(scanners, tinyConfig, utils, done) {
  var database = {};

  if (!scanners.length) {
    return done(database);
  }

  scanners.forEach(function(scanner) {
    var API = {
      done: function(result) {
        database[scanner.name] = result;
        scanner.done = true;
        console.log('scanner %s is done', scanner.name);

        if (!scanners.some(function(scanner) { return !scanner.done; })) {
          done(database);
        }
      }
    };

    console.log('running %s', scanner.name);
    scanner.runner(API, scanner.config, tinyConfig, utils);
  });
};

module.exports = scan;