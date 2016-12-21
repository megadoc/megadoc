const fs = require('fs-extra');
const path = require('path');
const async = require('async');
const compileCSS = require('./compileCSS');
const K = require('./constants');
const generateHTMLFile = require('./generateHTMLFile');
const generateRuntimeConfig = require('./generateRuntimeConfig');

module.exports = function emitAssets(config, state, done) {
  async.applyEach([
    config.compileCSS !== false && compileCSS,
    config.favicon && copyFavicon,
    copyAssets,
    copyAppScripts,
    !config.emitFiles && emitIndexHTMLFile,
    emitRuntimeConfigScript,
  ].filter(x => !!x), config, state, done);
};

function copyFavicon(config, state, done) {
  fs.copySync(
    state.assetUtils.getAssetPath(config.favicon),
    state.assetUtils.getOutputPath('favicon.ico')
  );

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
      state.assetUtils.getOutputPath('plugins', path.basename(filePath))
    );
  });

  done();
}

function emitIndexHTMLFile(config, state, done) {
  const html = generateHTMLFile({
    params: {
      title: config.title,
      metaDescription: config.metaDescription,
    },
    sourceFile: config.htmlFile,
    assets: state.assets,
    distanceFromRoot: 0
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
    fs.copySync(path.join(K.BUNDLE_DIR, file), state.assetUtils.getOutputPath(file));
  });

  done();
}

function emitRuntimeConfigScript(config, state, done) {
  const runtimeConfig = Object.assign(generateRuntimeConfig(config, state.assets), {
    database: state.flatCorpus,
  });

  if (config.verbose) {
    console.log('Registered UI plugins:',
      state.assets.pluginScripts.map(function(filePath) {
        return path.basename(filePath);
      })
    );
  }

  // write the runtime config file
  state.assetUtils.writeAsset(K.CONFIG_FILE,
    'window.exports["megadoc__config"] = ' + JSON.stringify(runtimeConfig) + ';'
  );

  done();
}
