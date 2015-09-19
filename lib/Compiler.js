var fs = require('fs-extra');
var EventEmitter = require('events').EventEmitter;
var Utils = require('./Utils');
var Assets = require('./Assets');
var Registry = require('./Registry');
var runAll = require('./utils/runAll');
var console = require('./Logger')('tinydoc');
var Promise = require('bluebird');

function Compiler(config) {
  EventEmitter.call(this);

  this.config = config;
  this.assets = new Assets();
  this.utils = new Utils(config);
  this.registry = new Registry();

  console.log('There are %d registered plugins:',
    config.plugins.length,
    config.plugins.map(function(p) { return p.name; })
  );

  config.plugins.forEach(function(plugin) {
    if (plugin.run) {
      plugin.run(this);
    }
  }.bind(this));

  return this;
}

Compiler.prototype = Object.create(EventEmitter.prototype);

Compiler.prototype.run = function(done, runOptions) {
  var svc = Promise.resolve();
  var tmpDir = this.config.tmpDir;

  fs.ensureDirSync(tmpDir);

  if (runOptions.scan) {
    svc = svc.then(this.scan.bind(this));
  }

  if (runOptions.index) {
    svc = svc.then(this.index.bind(this));
  }

  if (runOptions.write) {
    svc = svc.then(this.write.bind(this, runOptions));
  }

  if (runOptions.stats) {
    svc = svc.then(this.generateStats.bind(this));
  }

  svc.then(function(stats) {
    fs.removeSync(tmpDir);
    done(null, stats);
  }, function(err) {
    fs.removeSync(tmpDir);
    done(err);
  });
};

Compiler.prototype.generateStats = function() {
  var emitter = this;
  var stats = {};

  return new Promise(function(resolve, reject) {
    runAll(emitter.listeners('generateStats'), [ stats ], function(err) {
      if (err) {
        return reject(err);
      }

      resolve(stats);
    });
  });
};

Compiler.prototype.scan = function() {
  return new Promise(function(resolve, reject) {
    runAll(this.listeners('scan'), [], function(err) {
      if (err) {
        return reject(err);
      }

      resolve();
    }.bind(this));
  }.bind(this));
};

Compiler.prototype.index = function() {
  return new Promise(function(resolve, reject) {
    runAll(this.listeners('index'), [ this.registry ], function(err) {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  }.bind(this));
};

Compiler.prototype.write = function(runOptions) {
  return new Promise(function(resolve, reject) {
    // Purge the output directory before writing.
    var outputPath = this.utils.getOutputPath();

    if (fs.existsSync(outputPath) && runOptions.purge) {
      fs.removeSync(outputPath)
    }

    fs.ensureDirSync(outputPath);

    runAll(this.listeners('write'), [], function(err) {
      if (err) {
        return reject(err);
      }

      resolve();
    }.bind(this));
  }.bind(this));
};

module.exports = Compiler;