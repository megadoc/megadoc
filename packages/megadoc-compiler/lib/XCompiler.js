const fs = require('fs-extra');
const async = require('async');
const partial = require('./utils/partial');
const ConfigUtils = require('megadoc-config-utils');

const Compiler = exports;

const createCompilation = require('./stage00__createCompilation');
const parse = require('./stage01__parse');
const reduce = require('./stage01__reduce');
const render = require('./stage01__render');
const reduceTree = require('./stage02__reduceTree');
const composeTree = require('./stage03__composeTree');
const buildCorpus = require('./stage04__buildCorpus');
const renderTrees = require('./stage05__renderCorpus');
const emit = require('./stage06__emit');

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
Compiler.run = function(config, done) {
  const tmpDir = config.tmpDir;
  const commonOptions = config; // TODO
  const serializerSpec = ConfigUtils.getConfigurablePair(config.serializer) || {
    name: 'megadoc-html-serializer'
  };
  const Serializer = require(serializerSpec.name);
  const serializer = new Serializer(config, serializerSpec.options);
  const compilations = config.sources.map(partial(createCompilation, commonOptions));

  const compileTree = async.compose(
    partial(composeTree, config),
    partial(reduceTree, config),
    partial(render, config),
    partial(reduce, config),
    partial(parse, config)
  );

  const compileTreesIntoCorpus = async.compose(
    partial(emit, serializer),
    partial(renderTrees, config)
  );

  // /**
  //  * @property {LinkResolver}
  //  *
  //  * The link resolver for this compilation and corpus.
  //  */
  // const linkResolver = new LinkResolver(this.corpus, {
  //   relativeLinks: !this.inSinglePageMode(),
  //   ignore: config.linkResolver.ignore
  // });

  // /**
  //  * @property {Renderer}
  //  *
  //  * The renderer instance configured for this compilation.
  //  */
  // const renderer = new Renderer(config);

  async.series([
    function setup(callback) {
      // todo: cluster
      serializer.start(compilations, callback);
      fs.ensureDirSync(tmpDir);
    },

    function work(callback) {
      async.map(compilations, compileTree, function(err, withTrees) {
        if (err) {
          callback(err);
        }
        else {
          compileTreesIntoCorpus(withTrees, callback);
        }
      });
    },

    function cleanup(callback) {
      fs.removeSync(tmpDir);

      serializer.stop(callback);
    },
  ], function(err, results) {
    if (err) {
      try {
        serializer.stop(Function.prototype);
      }
      catch (_err) {
        //
      }
      finally {
        done(err);
      }
    }
    else {
      done(null, results[1]);
    }
  });
};
