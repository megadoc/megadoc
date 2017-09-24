const AssetUtils = require('./AssetUtils');
const ClientSandbox = require('./emit/ClientSandbox');
const NodeURIDecorator = require('./NodeURIDecorator');
const createAssets = require('./createAssets');
const render = require('./render');
const emit = require('./emit');
const purge = require('./purge');
const renderRoutines = require('./renderRoutines');
const defaults = require('./config');
const { omit } = require('lodash');

function HTMLSerializer(compilerConfig, userSerializerOptions = {}) {
  this.compilerConfig = compilerConfig;
  this.assetUtils = new AssetUtils(this.compilerConfig);
  this.config = Object.assign({},
    defaults,
    omit(userSerializerOptions, [ 'layoutOptions' ]),
    userSerializerOptions.layoutOptions
  );
  this.corpusVisitor = NodeURIDecorator(this.config);

  this.state = {
    assets: null,
    clientSandbox: new ClientSandbox(this.config),
  };
};

HTMLSerializer.prototype.renderRoutines = renderRoutines;

HTMLSerializer.prototype.start = function(compilations, done) {
  this.state.assets = createAssets(this.config, compilations);
  this.state.clientSandbox.start(this.state.assets, done);
};

HTMLSerializer.prototype.seal = function(withTrees, done) {
  render({ serializer: this, compilations: withTrees }, function(err, result) {
    if (err) {
      done(err)
    }
    else {
      done(null, {
        compilations: withTrees,
        renderedCorpus: result.renderedCorpus,
        edgeGraph: result.edgeGraph,
      })
    }
  });
};

HTMLSerializer.prototype.emit = function(withCorpus, done) {
  const { compilations, renderedCorpus } = withCorpus;

  emit({ serializer: this, compilations, renderedCorpus, }, function(err) {
    done(err, withCorpus);
  });
};

HTMLSerializer.prototype.purge = function(corpusInfo, done) {
  purge({ serializer: this, corpusInfo }, function(err) {
    done(err, corpusInfo);
  });
};

HTMLSerializer.prototype.stop = function(done) {
  this.state.clientSandbox.stop(this.state.assets, (err) => {
    if (err) {
      done(err);
    }
    else {
      this.state = {};

      done();
    }
  })
};

module.exports = HTMLSerializer;