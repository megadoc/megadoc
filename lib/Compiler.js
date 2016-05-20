var fs = require('fs-extra');
var EventEmitter = require('events').EventEmitter;
var AssetUtils = require('./AssetUtils');
var Assets = require('./Assets');
var LinkResolver = require('./HTMLSerializer__LinkResolver');
var Renderer = require('./Renderer');
var assert = require('assert');
var async = require('async');
var Corpus = require('megadoc-corpus');

var REQUIRED_ARGUMENTS = [
  'assetRoot',
  'tmpDir',
  'outputDir',
];

/**
 * The module that compiles the docs.
 *
 * @param {Object} config
 *        megadoc options.
 */
function Compiler(config) {
  var alias = config.alias || {};

  REQUIRED_ARGUMENTS.forEach(function(key) {
    assert(!!config[key],
      "Required parameter @" + key + " must be specified."
    );
  });

  /**
   * @method on
   *
   * Register a compilation event handler.
   *
   * @param {String} event
   *        The event to bind to.
   *
   * @param {Function} callback
   */

  /**
   * @method off
   *
   * Remove a previously registered event handler.
   *
   * @param {String} event
   *        The event you previously bound to.
   *
   * @param {Function} callback
   *        The *exact* callback you passed in [#on](), including the context
   *        binding if any.
   */

  EventEmitter.call(this);

  // this could get high if we have a large number of plugins...
  this.setMaxListeners(100);

  /**
   * @property {Config}
   *
   * The config that was supplied by the user.
   */
  this.config = config;

  /**
   * @property {Assets}
   *
   * The asset registry.
   */
  this.assets = new Assets();

  /**
   * @property {AssetUtils}
   *
   * A set of path-sensitive utils that take the user-configuration into
   * account.
   */
  this.utils = new AssetUtils(config);

  /**
   * @property {Corpus}
   *
   * The corpus for this compilation.
   */
  this.corpus = Corpus.Corpus();
  this.corpus.b = Corpus.Types.builders;

  /**
   * @property {LinkResolver}
   *
   * The link resolver for this compilation and corpus.
   */
  this.linkResolver = new LinkResolver(this.corpus, {
    relativeLinks: !this.inSinglePageMode()
  });

  /**
   * @property {Renderer}
   *
   * The renderer instance configured for this compilation.
   */
  this.renderer = new Renderer(config);

  // alias nodes
  this.corpus.visit({
    Document: function(node) {
      if (alias[node.uid]) {
        this.corpus.alias(node.uid, alias[node.uid]);
      }
    }.bind(this)
  });

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
  var that = this;
  var phases = [];
  var stats = {};

  fs.ensureDirSync(tmpDir);

  if (runOptions.scan) {
    phases.push(scan);
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

  async.applyEachSeries(phases, this, function(err) {
    fs.removeSync(tmpDir);

    if (err) {
      return done(err);
    }

    async.nextTick(function() {
      if (runOptions.includeCorpusInStats) {
        stats.corpus = that.corpus.toJSON();
      }

      done(null, stats);
    });
  });
};

Compiler.prototype.inSinglePageMode = function() {
  return !!this.config.layoutOptions.singlePageMode;
};

function generateStats(stats, compiler, done) {
  async.applyEach(compiler.listeners('generateStats'), stats, function(err) {
    if (err) {
      return done(err);
    }

    async.nextTick(done);
  });
}

function scan(compiler, done) {
  async.parallel(compiler.listeners('scan'), function(err) {
    if (err) {
      return done(err);
    }

    async.nextTick(done);
  });
}

function render(compiler, done) {
  var linkResolver = compiler.linkResolver;
  var linkify = linkResolver.linkify.bind(linkResolver);

  async.applyEach(compiler.listeners('render'), compiler.renderer, linkify, function(err) {
    if (err) {
      return done(err);
    }

    async.nextTick(done);
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

  async.series(compiler.listeners('write'), function(err) {
    if (err) {
      return done(err);
    }

    async.setImmediate(done);
  });
}

module.exports = Compiler;