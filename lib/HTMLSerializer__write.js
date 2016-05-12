var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var _ = require('lodash');
var compileCSS = require('./HTMLSerializer__compileCSS');
// var compileInlinePlugins = require('./HTMLSerializer__compileInlinePlugins');
var root = path.resolve(__dirname, '..');
var version = require(path.join(root, 'package')).version;
// TODO DRY alert, see HTMLSerializer__emitFiles.js
// var CORE_SCRIPTS = ['config.js', 'tinydoc__vendor.js', 'tinydoc.js'];
var CORE_STYLE_ENTRY = path.resolve(root, 'ui/css/index.less');
var Utils = require('./HTMLSerializer__Utils');

module.exports = function(config, compiler, database, done) {
  compiler.assets.styleSheets.unshift(CORE_STYLE_ENTRY);

  async.applyEach([ compileCSS ], compiler, config, function(err) {
    if (err) {
      done(err);
      return;
    }

    async.applyEach([
      copyFavicon,
      copyAssets,
      copyAppScripts,
      !config.emitFiles && generateHTMLFile,
      generateRuntimeConfigScript,
    ].filter(function(x) { return !!x }), compiler, config, database, done);
  });
};

function copyFavicon(compiler, config, _database, done) {
  var utils = compiler.utils;

  if (config.favicon) {
    fs.copySync(
      utils.getAssetPath(config.favicon),
      utils.getOutputPath('favicon.ico')
    );
  }

  done();
}

function copyAssets(compiler, config, _database, done) {
  var staticAssets = config.assets;
  var verbose = config.verbose;

  staticAssets.forEach(function(asset) {
    compiler.assets.add(asset);
  });

  compiler.assets.files.forEach(function(entry) {
    if (verbose) {
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
        compiler.utils.getAssetPath(entry.sourcePath)
      ,
      compiler.utils.getOutputPath(entry.outputPath)
    );
  });

  compiler.assets.pluginScripts.forEach(function(filePath) {
    fs.copySync(
      filePath,
      compiler.utils.getOutputPath('plugins', path.basename(filePath))
    );
  });

  done();
}

function generateHTMLFile(compiler, config, _database, done) {
  var html = Utils.generateHTMLFile({
    params: {
      title: config.title,
      metaDescription: config.metaDescription,
    },
    sourceFile: config.htmlFile,
    assets: compiler.assets,
    distanceFromRoot: 0
  });

  fs.writeFileSync(compiler.utils.getOutputPath('index.html'), html);

  done();
}

// copy the pre-compiled webpack bundles
function copyAppScripts(compiler, _config, _database, done) {
  fs.copySync(path.join(root, 'dist'), compiler.utils.getOutputPath());

  done();
}

function generateRuntimeConfigScript(compiler, config, database, done) {
  var runtimeConfig = _.extend({}, _.omit(config, [
    'plugins', 'assets',
  ]));

  runtimeConfig.version = version;
  runtimeConfig.pluginConfigs = compiler.assets.runtimeConfigs;
  runtimeConfig.pluginCount = compiler.assets.pluginScripts.length;
  runtimeConfig.pluginNames = compiler.assets.pluginScripts.map(function(filePath) {
    return path.basename(filePath).replace(/\.js$/, '');
  });

  console.log('UI Plugins:', Object.keys(runtimeConfig.pluginConfigs))

  runtimeConfig.corpus = compiler.registry.getCorpus();
  runtimeConfig.database = compiler.corpus.toJSON();

  if (config.verbose) {
    console.log('Registered UI plugins:',
      compiler.assets.pluginScripts.map(function(filePath) {
        return path.basename(filePath);
      })
    );

  }

  if (database.footer) {
    runtimeConfig.footer = database.footer;
  }

  // write the runtime config file
  compiler.utils.writeAsset('config.js',
    'window.CONFIG=' + JSON.stringify(runtimeConfig) + ';'
  );

  done();
}