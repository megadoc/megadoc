var fs = require('fs-extra');
var path = require('path');
var Logger = require('../lib/Logger');
// var Promise = require('promise');
var ASSETS_DIR = path.resolve(__dirname, '..', 'ui', 'dist');
var extend = require('lodash').extend;
var compileCssAssets = require('./ui/compileCssAssets');
var compileHtmlEntryFile = require('./ui/compileHtmlEntryFile');

module.exports = function(tiny, config, tinyConfig, utils) {
  var console = new Logger('ui writer');
  var outputDir = utils.resolvePath(config.outputDir);
  var runtimeConfig = extend({}, config, {
    plugins: tiny.getReporterPlugins('ui') // do we actually need this anymore?
  });

  if (config.readme) {
    runtimeConfig.readme = fs.readFileSync(
      path.resolve(tinyConfig.root, config.readme),
      'utf-8'
    );
  }

  console.log('Generating React app assets to %s', outputDir);

  fs.ensureDirSync(outputDir);

  Promise.all([
    compileHtmlEntryFile(config.publicPath, outputDir),
    compileCssAssets(tinyConfig.root, config, runtimeConfig.plugins, outputDir)
  ]).then(function() {

    fs.copySync(ASSETS_DIR, outputDir);
    fs.writeFileSync(
      path.resolve(outputDir, 'config.js'),
      'window.CONFIG=' + JSON.stringify(runtimeConfig) + ';'
    );

    console.log('\tDone.');
    tiny.done();
  }, function(error) {
    tiny.done(error);
  });

};
