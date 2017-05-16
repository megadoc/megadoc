const async = require('async');
const path = require('path');
const DocumentFileEmitter = require('./DocumentFileEmitter');
const emitAssets = require('./emitAssets');
const generateInlinePlugin = require('./generateInlinePlugin');
const { compile: compilePlugin } = require('./PluginCompiler');
const composeAsync = fns => async.compose.apply(async, fns);

module.exports = composeAsync([
  doEmitAssets,
  compileInlineScripts,
  prepare,
]);

function prepare({ serializer, compilations, corpus }, done) {
  done(null, {
    assets: serializer.state.assets,
    assetUtils: serializer.assetUtils,
    clientSandbox: serializer.state.clientSandbox,
    compilerConfig: serializer.compilerConfig,
    corpus,
    serializerConfig: serializer.config,
  });
};

function doEmitAssets(compilation, done) {
  const {
    assets,
    assetUtils,
    clientSandbox,
    compilerConfig,
    corpus,
    serializerConfig,
  } = compilation;

  const flatCorpus = corpus.toJSON();
  const documentUIDs = Object.keys(flatCorpus);

  if (compilerConfig.verbose) {
    console.log('[D] Emitting files for corpus of size %d', documentUIDs.length)
  }

  const client = clientSandbox.createClient(assets, flatCorpus);

  const emitDocumentFile = DocumentFileEmitter({
    assetRoot: compilerConfig.outputDir,
    assetUtils: assetUtils,
    assets: assets,
    favicon: serializerConfig.favicon ? 'favicon.ico' : null,
    runtimeOutputPath: serializerConfig.runtimeOutputPath,
    corpus: flatCorpus,
    htmlFile: serializerConfig.htmlFile,
    ui: client,
    verbose: compilerConfig.verbose,
  });

  emitAssets(
    Object.assign({}, serializerConfig, {
      assetRoot: compilerConfig.outputDir,
      verbose: compilerConfig.verbose,
    }),
    {
      assets: assets,
      flatCorpus: flatCorpus,
      assetUtils: assetUtils,
    },
    (err) => {
      if (err) {
        done(err);
      }
      else {
        async.eachSeries(documentUIDs, emitDocumentFile, function(emitErr) {
          done(emitErr, compilation)
        });
      }
    }
  )
}

function compileInlineScripts(compilation, done) {
  const { assets, compilerConfig, serializerConfig } = compilation;
  const inlinePluginPath = path.join(compilerConfig.tmpDir, 'megadoc-plugin-inline.source.js');
  const inlinePluginRuntimePath = path.join(compilerConfig.tmpDir, 'megadoc-plugin-inline.js');
  const hasInlineScripts = !generateInlinePlugin({
    config: serializerConfig,
    outputPath: inlinePluginPath,
  });

  if (!hasInlineScripts) {
    return done(null, compilation);
  }

  compilePlugin(
    [ inlinePluginPath ],
    inlinePluginRuntimePath,
    { optimize: true, verbose: compilerConfig.verbose },
    err => {
      if (err) {
        done(err);
      }
      else {
        assets.addPluginScript(inlinePluginRuntimePath)
        done(null, compilation);
      }
    }
  );
}

