var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var root = path.resolve(__dirname, '..', '..', '..');
var _ = require('lodash');
var compileCSS = require('./write/compileCSS');
var compileInlinePlugins = require('./write/compileInlinePlugins');
var CORE_SCRIPTS = ['config.js', 'vendor.js', 'main.js'];
var CORE_STYLE = path.resolve(root, 'ui', 'css', 'index.less');
var version = require(path.join(root, 'package')).version;

module.exports = function(config, compiler, database, done) {
  compiler.assets.styleSheets.unshift(CORE_STYLE);

  async.applyEach([ compileInlinePlugins, compileCSS ], compiler, config, function(err) {
    if (err) {
      done(err);
      return;
    }

    async.applyEach([
      copyFavicon,
      copyAssets,
      copyAppScripts,
      generateHTMLFile,
      generateRuntimeConfigScript,
    ], compiler, config, database, done);
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
  var scripts = CORE_SCRIPTS
    .concat(compiler.assets.runtimeScripts)
    .concat(
      compiler.assets.pluginScripts.map(function(filePath) {
        return 'plugins/' + path.basename(filePath);
      })
    )
  ;

  if (compiler.assets.hasInlinePlugins()) {
    scripts.push('inline_plugins.js');
  }

  var tmpl = _.template(
    fs.readFileSync(path.join(root, 'ui', 'index.tmpl.html'), 'utf-8')
  );

  var html = tmpl({
    title: config.title,
    metaDescription: config.metaDescription,
    scripts: scripts
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
    'outputDir', 'plugins', 'assets',
  ]));

  runtimeConfig.version = version;
  runtimeConfig.pluginConfigs = compiler.assets.runtimeConfigs;
  runtimeConfig.pluginCount = compiler.assets.pluginScripts.length;

  if (compiler.assets.hasInlinePlugins()) {
    runtimeConfig.pluginCount += 1;
  }

  runtimeConfig.corpus = compiler.registry.getCorpus();

  if (config.verbose) {
    console.log('Registered UI plugins:',
      compiler.assets.pluginScripts.map(function(filePath) {
        return path.basename(filePath);
      })
    );
  }

  if (database.readme) {
    runtimeConfig.readme = {
      filePath: config.readme,
      source: database.readme,
      git: database.readmeGitStats
    };
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