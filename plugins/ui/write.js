var fs = require('fs-extra');
var path = require('path');
var UI_DIR = path.resolve(__dirname, '..', '..', 'ui');
var _ = require('lodash');
var compileCSS = require('./write/compileCSS');
var compileJS = require('./write/compileJS');
var CORE_SCRIPTS = ['config.js', 'vendor.js', 'main.js', 'styles.js'];
var runAll = require('../../lib/utils/runAll');

module.exports = function(config, compiler, readmeGitStats, done) {
  runAll([ compileJS, compileCSS ], [ compiler, config ], function(err) {
    if (err) {
      done(err);
      return;
    }

    copyFavicon(compiler, config);
    copyAssets(compiler, config.assets);
    copyAppScripts(compiler);
    generateHTMLFile(compiler, config);
    generateRuntimeConfigScript(compiler, config, readmeGitStats);

    done();
  });
};

function copyFavicon(compiler, config) {
  var utils = compiler.utils;

  if (config.favicon) {
    fs.copySync(
      utils.getAssetPath(config.favicon),
      utils.getOutputPath('favicon.ico')
    );
  }
}

function copyAssets(compiler, staticAssets) {
  staticAssets.forEach(function(asset) {
    compiler.assets.add(asset);
  });

  compiler.assets.files.forEach(function(entry) {
    console.log('Copying asset:', entry.sourcePath);

    fs.copySync(
      compiler.utils.getAssetPath(entry.sourcePath),
      compiler.utils.getOutputPath(entry.outputPath)
    );
  });
}

function generateHTMLFile(compiler, config) {
  var scripts = CORE_SCRIPTS
    .concat(compiler.assets.runtimeScripts)
    .concat(compiler.assets.pluginScripts)
  ;

  if (compiler.assets.hasInlinePlugins()) {
    scripts.push('inline_plugins.js');
  }

  var tmpl = _.template(
    fs.readFileSync(path.join(UI_DIR, 'app', 'index.tmpl.html'), 'utf-8')
  );

  var html = tmpl({
    title: config.title,
    scripts: scripts.map(function(script) {
      return path.join(config.publicPath, script);
    })
  });


  fs.writeFileSync(compiler.utils.getOutputPath('index.html'), html);
}

// copy the pre-compiled webpack bundles
function copyAppScripts(compiler) {
  fs.copySync(path.join(UI_DIR, 'dist'), compiler.utils.getOutputPath());
}

function generateRuntimeConfigScript(compiler, config, readmeGitStats) {
  var runtimeConfig = _.extend(
    {},
    _.omit(config, [ 'outputDir', 'plugins', 'assets', ]),
    {
      pluginCount: (
        compiler.assets.pluginScripts.length +
        (compiler.assets.hasInlinePlugins() ? 1 : 0)
      ),
      pluginConfigs: compiler.assets.runtimeConfigs,
      registry: compiler.registry.toJSON()
    }
  );

  console.log('Registered UI plugins:', compiler.assets.pluginScripts)

  if (config.readme) {
    runtimeConfig.readme = {
      filePath: config.readme,
      source: fs.readFileSync(compiler.utils.getAssetPath(config.readme), 'utf-8'),
      git: readmeGitStats
    };
  }

  // write the runtime config file
  compiler.utils.writeAsset('config.js',
    'window.CONFIG=' + JSON.stringify(runtimeConfig) + ';'
  );
}