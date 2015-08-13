var fs = require('fs-extra');
var path = require('path');
var Logger = require('../lib/Logger');
var ASSETS_DIR = path.resolve(__dirname, '..', 'dist');
var extend = require('lodash').extend;

module.exports = function(tiny, config, tinyConfig, utils) {
  var console = new Logger('cjs');

  var outputDir = utils.resolvePath(tiny.getPluginConfigItem('ui', 'outputDir'), 'plugins');

  var runtimeConfig = extend({}, config, {
    database: tiny.getScannerOutput()
  });

  console.log('Generating JS React app assets to %s', outputDir);

  fs.ensureDirSync(outputDir);
  // fs.copySync(
  //   path.resolve(ASSETS_DIR, 'index.js'),
  //   path.resolve(outputDir, 'cjs.js')
  // );

  fs.writeFileSync(
    path.resolve(outputDir, 'cjs-config.js'),
    'window["cjs-config"]=' + JSON.stringify(runtimeConfig) + ';'
  );

  console.log('\tDone.');

  tiny.done();
};
