var fs = require('fs-extra');
var path = require('path');
var UI_DIR = path.resolve(__dirname, '..', '..', 'ui');
var extend = require('lodash').extend;
var template = require('lodash').template;

function generateHTMLIndex(publicPath, scripts, title) {
  return template(fs.readFileSync(path.join(UI_DIR, 'app', 'index.tmpl.html'), 'utf-8'))({
    title: title,
    scripts: scripts.map(function(script) {
      return path.join(publicPath, script);
    })
  });
}

module.exports = function(config, registry, utils, readmeGitStats, done) {
  var outputDir = utils.getAssetPath(config.outputDir);
  var runtimeConfig = extend({}, config, {
    registry: registry.toJSON()
  });

  var scripts = [
    'config.js',
    'vendor.js',
    'main.js',
    'styles.js',
  ].concat(config.scripts).concat(config.pluginScripts);

  if (config.readme) {
    runtimeConfig.readme = {
      filePath: config.readme,
      source: fs.readFileSync(utils.getAssetPath(config.readme), 'utf-8'),
      git: readmeGitStats
    };
  }

  if (config.favicon) {
    fs.copySync(utils.getAssetPath(config.favicon), path.resolve(outputDir, 'favicon.ico'));
  }

  config.assets.forEach(function(filePath) {
    fs.copySync(utils.getAssetPath(filePath), path.resolve(outputDir, 'assets', filePath));
  });

  fs.writeFileSync(
    path.resolve(outputDir, 'index.html'),
    generateHTMLIndex(config.publicPath, scripts, config.title)
  );

  // copy the pre-compiled webpack bundles
  fs.copySync(path.join(UI_DIR, 'dist'), outputDir);

  // write the runtime config file
  utils.writeAsset('config.js', 'window.CONFIG=' + JSON.stringify(runtimeConfig) + ';');

  done();
};
