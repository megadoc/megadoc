var extend = require('lodash').extend;

module.exports = function(database, config, utils, done) {
  var runtimeConfig = extend({}, config, { database: database });

  utils.writeAsset(
    'plugins/markdown-config.js',
    'window["markdown-config"]=' + JSON.stringify(runtimeConfig) + ';'
  );

  done();
};
