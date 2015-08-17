var exec = require('child_process').exec;
var fs = require('fs');
var glob = require('glob');
var extend = require('lodash').extend;

function generateDocs(config, globalConfig, done) {
  var env = config.env || {};
  var yardApi = exec(config.command, extend({}, {
    cwd: env.cwd || globalConfig.assetRoot
  }));

  yardApi.stdout.pipe(process.stdout);
  yardApi.stderr.pipe(process.stderr);

  yardApi.on('close', function(exitCode, signal) {
    if (exitCode === 0) {
      done();
    }
    else {
      done('yard-api failed to generate the docs');
    }
  });
}

function scan(config, utils, done) {
  glob(utils.assetPath(config.source), { nodir: true }, function (err, files) {
    if (err) {
      return done(err, null);
    }

    var database = files.map(function(fileName) {
      return JSON.parse(fs.readFileSync(fileName, 'utf-8'));
    });

    done(null, database);
  });
}


module.exports = function(config, globalConfig, utils, done) {
  generateDocs(config, globalConfig, function(err) {
    if (err) {
      return done(err);
    }

    scan(config, utils, done);
  });
};