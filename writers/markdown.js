var fs = require('fs-extra');
var path = require('path');
var Logger = require('../lib/Logger');
var extend = require('lodash').extend;
var ASSETS_DIR = path.resolve(__dirname, '..', 'dist');

module.exports = function(tiny, config, tinyConfig, utils) {
  var console = new Logger('markdown-writer');

  var reactOutputDir = tiny.getPluginConfigItem('ui', 'outputDir');
  var outputDir = utils.resolvePath(reactOutputDir, 'plugins');

  var runtimeConfig = extend({}, config, {
    database: tiny.getScannerOutput()
  });

  console.log('Generating markdown assets to %s', outputDir);

  fs.ensureDirSync(outputDir);
  // fs.copySync(
  //   path.resolve(ASSETS_DIR, 'index.js'),
  //   path.resolve(outputDir, 'markdown.js')
  // );

  fs.writeFileSync(
    path.resolve(outputDir, 'markdown-config.js'),
    'window["markdown-config"]=' + JSON.stringify(runtimeConfig) + ';'
  );

  console.log('\tDone.');

  tiny.done();
};
