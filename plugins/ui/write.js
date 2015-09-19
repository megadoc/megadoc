var fs = require('fs-extra');
var path = require('path');
var UI_DIR = path.resolve(__dirname, '..', '..', 'ui');
var _ = require('lodash');
var compileCSS = require('./write/compileCSS');
var CORE_SCRIPTS = ['config.js', 'vendor.js', 'main.js', 'styles.js'];

module.exports = function(config, compiler, readmeGitStats, done) {
  compileCSS(compiler, config).then(function() {
    copyFavicon(compiler, config);
    copyAssets(compiler, config.assets);
    copyAppScripts(compiler);
    generateHTMLFile(compiler, config);
    generateRuntimeConfigScript(compiler, config, readmeGitStats);

    done();
  }, done);
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

  compiler.assets.files.forEach(function(filePath) {
    console.log('Copying asset:', filePath);

    fs.copySync(
      compiler.utils.getAssetPath(filePath),
      compiler.utils.getOutputPath('assets', filePath)
    );
  });
}

function generateHTMLFile(compiler, config) {
  var scripts = CORE_SCRIPTS
    .concat(compiler.assets.runtimeScripts)
    .concat(compiler.assets.pluginScripts)
  ;

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
      pluginCount: compiler.assets.pluginScripts.length,
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