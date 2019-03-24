const fs = require('fs-extra');
const path = require('path');
const async = require('async');
const compileCSS = require('./compileCSS');
const K = require('../constants');
const generateHTMLFile = require('./generateHTMLFile');
const generateRuntimeConfig = require('./generateRuntimeConfig');

module.exports = function emitAssets(config, state, done) {
  async.applyEach([
    config.compileCSS !== false && compileCSS,
    config.favicon && copyFavicon,
    copyAssets,
    copyAppScripts,
    emitIndexHTMLFile,
    emitRuntimeConfigScript,
  ].filter(x => !!x), config, state, done);
};

function copyFavicon(config, state, done) {
  const filePath = state.assetUtils.getAssetPath(config.favicon);

  if (fs.existsSync(filePath)) {
    fs.copySync(
      state.assetUtils.getAssetPath(config.favicon),
      state.assetUtils.getOutputPath('favicon.ico')
    );
  }

  done();
}

function copyAssets(config, state, done) {
  state.assets.files.forEach(function(entry) {
    if (config.verbose) {
      if (entry.hasCustomOutputPath) {
        console.log('Copying asset "%s" => "%s".', entry.sourcePath, entry.outputPath);
      }
      else {
        console.log('Copying asset "%s".', entry.sourcePath);
      }
    }

    fs.copySync(
      entry.isAbsolute ?
        '/' + entry.sourcePath :
        state.assetUtils.getAssetPath(entry.sourcePath)
      ,
      state.assetUtils.getOutputPath(entry.outputPath)
    );
  });

  state.assets.pluginScripts.forEach(function(filePath) {
    fs.copySync(
      filePath,
      state.assetUtils.getOutputPath(config.runtimeOutputPath, path.basename(filePath))
    );
  });

  done();
}

function emitIndexHTMLFile(config, state, done) {
  const html = generateHTMLFile({
    params: {
      title: config.title,
      metaDescription: config.metaDescription,
      startingDocumentHref: '/index.html',
    },
    sourceFile: config.htmlFile,
    runtimeOutputPath: config.runtimeOutputPath,
    assets: state.assets,
    distanceFromRoot: 0,
    favicon: 'favicon.ico'
  });

  fs.writeFileSync(state.assetUtils.getOutputPath('index.html'), html);

  done();
}

// copy the pre-compiled webpack bundles
function copyAppScripts(config, state, done) {
  [
    K.VENDOR_BUNDLE + '.js',
    K.COMMON_BUNDLE + '.js',
    K.MAIN_BUNDLE + '.js',
  ].forEach(function(file) {
    fs.copySync(
      path.join(K.BUNDLE_DIR, file),
      state.assetUtils.getOutputPath(config.runtimeOutputPath, file)
    );
  });

  done();
}

function emitRuntimeConfigScript(config, state, done) {
  const runtimeConfig = generateRuntimeConfig({
    assets: state.assets,
    config,
    corpus: state.flatCorpus,
  });

  if (config.verbose) {
    console.log('Registered UI plugins:',
      state.assets.pluginScripts.map(function(filePath) {
        return path.basename(filePath);
      })
    );
  }

  // write the runtime config file
  state.assetUtils.writeAsset(
    path.join(config.runtimeOutputPath, K.CONFIG_FILE),
    exportJSONAsUMD('megadoc__config', JSON.stringify(runtimeConfig)),
    { forceOverwrite: true }
  );

  done();
}

function exportJSONAsUMD(exportName, content) {
  return `
(function(__ref__) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = __ref__;
  }
  else if (typeof exports === 'object') {
    exports['${exportName}'] = __ref__;
  }
  else if (typeof window === 'object') {
    window['${exportName}'] = __ref__;
  }
}(${content}))
  `;
}
