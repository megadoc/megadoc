var CSSCompiler = require('./CSSCompiler');
var ScriptLoader = require('./ScriptLoader');
var Utils = require('./Utils');
var deepGet = require('./utils/deepGet');
var runAll = require('./utils/runAll');
var EventEmitter = require('events');
var console = new require('./Logger')('tinydoc');
var fs = require('fs-extra');

function Compiler(config) {
  var inject = function(mod) {
    var deps = (mod.$inject || []).map(function(modulePath) {
      return deepGet(this, modulePath);
    }.bind(this));

    return mod.apply(mod, deps);
  }.bind(this);

  this.utils = new Utils(config);
  this.cssCompiler = new CSSCompiler(this.utils.assetPath);
  this.scriptLoader = new ScriptLoader(this.utils);
  this.emitter = new EventEmitter();
  this.config = config;

  console.log('There are %d registered plugins.', config.plugins.length);

  this.plugins = config.plugins.map(inject);

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
    svc.then(this.scan.bind(this, compilation));
  }

  if (runOptions.write) {
    svc.then(this.write.bind(this, compilation));
  }

  svc.then(function() {
    done(null, compilation);
  }, function(err) {
    done(err);
  });
};

module.exports = Compiler;