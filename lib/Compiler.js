var fs = require('fs-extra');
var EventEmitter = require('events').EventEmitter;
var Utils = require('./Utils');
var CSSCompiler = require('./CSSCompiler');
var Registry = require('./Registry');
var deepGet = require('./utils/deepGet');
var runAll = require('./utils/runAll');
var console = require('./Logger')('tinydoc');
var Promise = require('bluebird');

function Compiler(config) {
  var inject = function(mod) {
    var deps = (mod.$inject || []).map(function(modulePath) {
      return deepGet(this, modulePath);
    }.bind(this));

    return mod.apply(mod, deps);
  }.bind(this);

  this.utils = new Utils(config);
  this.cssCompiler = new CSSCompiler(this.utils.getAssetPath);
  this.emitter = new EventEmitter();
  this.registry = new Registry();
  this.config = config;

  this.plugins = config.plugins.map(inject);

  console.log('There are %d registered plugins:',
    config.plugins.length,
    config.plugins.map(function(p) { return p.name; })
  );

  return this;
}

Compiler.prototype.scan = function(compilation) {
  return new Promise(function(resolve, reject) {
    runAll(this.emitter.listeners('scan'), [ compilation ], function(err) {
      if (err) {
        return reject(err);
      }

      compilation.scanned = true;

      fs.ensureDirSync(this.utils.getAssetPath(this.config.outputDir));

      resolve();
    }.bind(this));
  }.bind(this));
};

Compiler.prototype.write = function(compilation) {
  return new Promise(function(resolve, reject) {
    runAll(this.emitter.listeners('write'), [ compilation ], function(err) {
      if (err) {
        return reject(err);
      }

      this.cssCompiler.run(this.config).then(resolve, reject);
    }.bind(this));
  }.bind(this));
};

Compiler.prototype.index = function(compilation) {
  var emitter = this.emitter;
  var registry = this.registry;

  return new Promise(function(resolve, reject) {
    runAll(emitter.listeners('index'), [ compilation, registry ], function(err) {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
};

Compiler.prototype.run = function(done, runOptions) {
  var svc = Promise.resolve();
  var compilation = {
    scanned: false,
    written: false,
    indexed: false
  };

  if (runOptions.scan) {
    svc = svc.then(this.scan.bind(this, compilation));
  }

  if (runOptions.index) {
    svc = svc.then(this.index.bind(this, compilation));
  }

  if (runOptions.write) {
    svc = svc.then(this.write.bind(this, compilation));
  }

  svc.then(function() {
    done(null, compilation);
  }, function(err) {
    done(err);
  });
};

Compiler.prototype.generateStats = function(compilation) {
  var emitter = this.emitter;
  var stats = {};

  return new Promise(function(resolve, reject) {
    runAll(emitter.listeners('generateStats'), [ compilation, stats ], function(err) {
      if (err) {
        return reject(err);
      }

      resolve(stats);
    });
  });
};


module.exports = Compiler;