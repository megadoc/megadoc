var fs = require('fs-extra');
var EventEmitter = require('events').EventEmitter;
var Utils = require('./Utils');
var Assets = require('./Assets');
var Registry = require('./Registry');
var LinkResolver = require('./LinkResolver');
var Renderer = require('./Renderer');
var runAll = require('./utils/runAll');
var assert = require('assert');

var REQUIRED_ARGUMENTS = [
  'assetRoot',
  'tmpDir',
  'outputDir',
];

/**
 * @namespace Core
 *
 * The module that compiles the docs.
 *
 * @param {Object} config
 *        tinydoc options.
 */
function Compiler(config) {
  REQUIRED_ARGUMENTS.forEach(function(key) {
    assert(!!config[key],
      "Required parameter @" + key + " must be specified."
    );
  });

  /**
   * @method on
   *
   * @param {String} event
   *        The event to bind to.
   */
  EventEmitter.call(this);

  /**
   * @property {Object}
   *
   * The config that was supplied by the user.
   */
  this.config = config;

  /**
   * @property {Core.Assets}
   *
   * The asset registry.
   */
  this.assets = new Assets();

  /**
   * @property {Core.Utils}
   *
   * A set of path-sensitive utils that take the user-configuration into
   * account.
   */
  this.utils = new Utils(config);

  /**
   * @property {Core.Registry}
   *
   * The index registry.
   */
  this.registry = new Registry();

  this.linkResolver = new LinkResolver(this.registry);
  this.renderer = new Renderer(config);

  return this;
}

Compiler.prototype = Object.create(EventEmitter.prototype);

/**
 * Perform the compilation.
 *
 * @param {Function} done
 *        Callback to invoke when the compilation is complete.
 *
 * @param {String|Error} done.err
 *        If present, the compilation has failed. This parameter provides some
 *        context around the failure.
 *
 * @param  {Object} runOptions
 *         A set of options to control the compilation.
 *
 * @param {Boolean} [runOptions.stats=false]
 *        Turn this on if you want to generate compile-time statistics.
 */
Compiler.prototype.run = function(runOptions, done) {
  var tmpDir = this.config.tmpDir;
  var phases = [];
  var stats = {};

  fs.ensureDirSync(tmpDir);

  if (runOptions.scan) {
    phases.push(scan);
  }

  if (runOptions.scan && runOptions.index) {
    phases.push(index);
  }

  if (runOptions.scan && runOptions.render) {
    phases.push(render);
  }

  // Purge the output directory before writing.
  if (runOptions.purge) {
    phases.push(purge);
  }

  if (runOptions.write) {
    phases.push(write);
  }

  if (runOptions.stats) {
    phases.push(generateStats.bind(null, stats));
  }

  runAll(phases, [ this ], function(err) {
    fs.removeSync(tmpDir);

    if (err) {
      return done(err);
    }

    done(null, stats);
  });
};

function generateStats(stats, compiler, done) {
  runAll(compiler.listeners('generateStats'), [ stats ], function(err) {
    if (err) {
      return done(err);
    }

    done();
  });
}

function scan(compiler, done) {
  runAll(compiler.listeners('scan'), [], function(err) {
    if (err) {
      return done(err);
    }

    done();
  });
}

function index(compiler, done) {
  runAll(compiler.listeners('index'), [ compiler.registry ], function(err) {
    if (err) {
      return done(err);
    }

    done();
  });
}

function render(compiler, done) {
  var linkResolver = compiler.linkResolver;
  var linkify = linkResolver.linkify.bind(linkResolver);

  runAll(compiler.listeners('render'), [ compiler.renderer, linkify ], function(err) {
    if (err) {
      return done(err);
    }

    done();
  });
}

function purge(compiler, done) {
  var outputPath = compiler.utils.getOutputPath();

  if (fs.existsSync(outputPath)) {
    fs.removeSync(outputPath);
  }

  done();
}

function write(compiler, done) {
  var outputPath = compiler.utils.getOutputPath();

  fs.ensureDirSync(outputPath);

  runAll(compiler.listeners('write'), [], function(err) {
    if (err) {
      return done(err);
    }

    done();
  });
}

module.exports = Compiler;