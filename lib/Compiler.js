var fs = require('fs-extra');
var events = require('events');
var EventEmitter = events.EventEmitter || events; // node 0.10 compatibility
var Utils = require('./Utils');
var CSSCompiler = require('./CSSCompiler');
var deepGet = require('./utils/deepGet');
var runAll = require('./utils/runAll');
var console = require('./Logger')('tinydoc');

function Compiler(config) {
  var inject = function(mod) {
    var deps = (mod.$inject || []).map(function(modulePath) {
      return deepGet(this, modulePath);
    }.bind(this));

    return mod.apply(mod, deps);
  }.bind(this);

  this.utils = new Utils(config);
  this.cssCompiler = new CSSCompiler(this.utils.assetPath);
  this.emitter = new EventEmitter();
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

      fs.ensureDirSync(this.utils.assetPath(this.config.outputDir));

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

Compiler.prototype.run = function(done, runOptions) {
  var svc = Promise.resolve();
  var compilation = {
    scanned: false,
    written: false
  };

  if (runOptions.scan) {
    svc = svc.then(this.scan.bind(this, compilation));
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

module.exports = Compiler;