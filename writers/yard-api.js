var fs = require('fs-extra');
var path = require('path');
var Logger = require('../lib/Logger');
var ASSETS_DIR = path.resolve(__dirname, '..', 'dist');
var extend = require('lodash').extend;

module.exports = function(tiny, config, tinyConfig, utils) {
  var console = new Logger('yard-api writer');

  var outputDir = utils.resolvePath(
    tiny.getPluginConfigItem('ui', 'outputDir'),
    'plugins'
  );

  var runtimeConfig = extend({}, config, {
    database: tiny.getScannerOutput()
  });

  console.log('Generating yard-api React app assets to %s', outputDir);

  fs.ensureDirSync(outputDir);
  // fs.copySync(
  //   path.resolve(ASSETS_DIR, 'index.js'),
  //   path.resolve(outputDir, 'yard-api.js')
  // );

  fs.writeFileSync(
    path.resolve(outputDir, 'yard-api-config.js'),
    'window["yard-api-config"]=' + JSON.stringify(runtimeConfig) + ';'
  );

  console.log('\tDone.');

  tiny.done();
};
