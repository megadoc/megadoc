var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');
var pick = _.pick;
var extend = _.extend;
var ASSET_PATH = path.join(__dirname, '..', 'www');

module.exports = function(runtimeDir, reportBlob) {
  var runtimeConfig = {
    reportBlob: reportBlob
  };

  fs.copySync(ASSET_PATH, runtimeDir);

  fs.writeFileSync(path.join(runtimeDir, 'config.js'),
    'window.PIERCE_CONFIG =' + JSON.stringify(runtimeConfig) + ';'
  );
};