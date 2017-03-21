const async = require('async');
const MegadocCorpus = require('megadoc-corpus');
const AssetUtils = require('./AssetUtils');
const DocumentFileEmitter = require('./DocumentFileEmitter');
const ClientSandbox = require('./ClientSandbox');
const NodeURIDecorator = require('./NodeURIDecorator');
const TreeRenderer = require('./TreeRenderer');
const createAssets = require('./createAssets');
const emitAssets = require('./emitAssets');
const Renderer = require('./Renderer');
const LinkResolver = require('./LinkResolver');
const renderRoutines = require('./renderRoutines');
const DefaultConfig = require('./config');
const K = require('./constants');

function HTMLSerializer(compilerConfig, userSerializerOptions) {
  this.compilerConfig = {
    assetRoot: compilerConfig.assetRoot,
    outputDir: compilerConfig.outputDir,
    tmpDir: compilerConfig.tmpDir,
    verbose: compilerConfig.verbose,
    strict: compilerConfig.strict,
  };

  this.assetUtils = new AssetUtils(this.compilerConfig);
  this.config = Object.assign({}, DefaultConfig, userSerializerOptions);
  this.corpusVisitor = NodeURIDecorator(this.config);

  this.markdownRenderer = new Renderer({
    launchExternalLinksInNewTabs: this.config.launchExternalLinksInNewTabs,
    shortURLs: !this.config.layoutOptions.singlePageMode,
    syntaxHighlighting: this.config.syntaxHighlighting,
  });

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

HTMLSerializer.prototype.renderCorpus = function(withTrees, done) {
  const corpusInfo = aggregateTreesIntoCorpus(this, withTrees);
  const corpus = corpusInfo.corpus;
  const rootNodes = corpusInfo.rootNodes;

  const withNodes = rootNodes.map((node, index) => {
    return { node: node, compilation: withTrees[index] };
  });

  const linkResolver = new LinkResolver(corpus, {
    relativeLinks: !this.config.layoutOptions.singlePageMode,
    ignore: this.config.linkResolver.ignore,
    injectors: this.config.linkResolver.injectors,
  });

  const state = {
    commonOptions: this.compilerConfig,
    markdownRenderer: this.markdownRenderer,
    linkResolver: linkResolver,
    corpus: corpus,
  };

  // todo: distribute
  async.map(withNodes, renderTree, (err, renderedNodes) => {
    if (err) {
      done(err);
    }
    else {
      const renderedCorpus = aggregateRenderedTreesIntoCorpus(this, renderedNodes);

      done(null, {
        compilations: withTrees,
        corpus: renderedCorpus,
        edgeGraph: null
      });
    }
  });

  function renderTree(compilationWithNode, callback) {
    const node = compilationWithNode.node;
    const compilation = compilationWithNode.compilation;
    const renderOperations = compilation.renderOperations;

    callback(null, TreeRenderer.renderTree(state, node, renderOperations));
  }
};

HTMLSerializer.prototype.emitCorpusDocuments = function(corpusInfo, done) {
  const flatCorpus = corpusInfo.corpus.toJSON();
  const documentUIDs = Object.keys(flatCorpus);
  const client = this.state.clientSandbox.createClient(this.state.assets, flatCorpus);
  const emitDocumentFile = DocumentFileEmitter({
    assetRoot: this.compilerConfig.outputDir,
    assetUtils: this.assetUtils,
    assets: this.state.assets,
    corpus: flatCorpus,
    htmlFile: this.config.htmlFile,
    ui: client,
    verbose: this.compilerConfig.verbose,
  });

  console.log('[D] Emitting files for corpus of size %d', documentUIDs.length)

  emitAssets(
    Object.assign({}, this.config, {
      assetRoot: this.compilerConfig.outputDir,
      verbose: this.compilerConfig.verbose,
    }),
    {
      assets: this.state.assets,
      flatCorpus: flatCorpus,
      assetUtils: this.assetUtils,
    },
    (err) => {
      if (err) {
        return done(err);
      }
      else {
        async.eachSeries(documentUIDs, emitDocumentFile, function(emitErr) {
          done(emitErr, corpusInfo)
        });
      }
    }
  )
};

HTMLSerializer.prototype.purgeEmittedCorpusDocuments = function(corpusInfo, done) {
  const flatCorpus = corpusInfo.corpus.toJSON();
  const documentUIDs = Object.keys(flatCorpus);
  const filePaths = documentUIDs.reduce((map, uid) => {
    const node = flatCorpus[uid];
    const filePath = node.meta && node.meta.htmlFilePath;

    if (filePath) {
      map[filePath] = true;
    }

    return map;
  }, {});

  const removeDocumentFile = (filePath, callback) => {
    console.log('[D] Document file "%s" will be purged.', filePath);

    this.assetUtils.removeAsset(filePath, callback);
  }

  async.eachSeries(Object.keys(filePaths).concat([
    K.CONFIG_FILE
  ]), removeDocumentFile, function(emitErr) {
    done(emitErr, corpusInfo)
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

function aggregateTreesIntoCorpus(serializer, compilations) {
  const corpus = MegadocCorpus.Corpus({
    strict: serializer.compilerConfig.strict,
    debug: serializer.compilerConfig.debug
  });

  corpus.visit(serializer.corpusVisitor);

  const rootNodes = compilations.map(function(compilation) {
    const serializerOptions = compilation.processor.serializerOptions.html || {};

    compilation.tree.meta.defaultLayouts = serializerOptions.defaultLayouts;

    return corpus.add(compilation.tree);
  });

  return { corpus: corpus, rootNodes: rootNodes };
}

function aggregateRenderedTreesIntoCorpus(serializer, trees) {
  const corpus = MegadocCorpus.Corpus({
    strict: serializer.compilerConfig.strict,
    debug: serializer.compilerConfig.debug
  });

  trees.forEach(function(tree) {
    corpus.add(tree);
  });

  return corpus;
}

module.exports = HTMLSerializer;
