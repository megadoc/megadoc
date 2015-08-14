var extend = require('lodash').extend;

module.exports = function(database, config, utils, done) {
  var runtimeConfig = extend({}, config, { database: database });

  utils.writeAsset(
    'plugins/cjs-config.js',
    'window["cjs-config"]=' + JSON.stringify(runtimeConfig) + ';'
  );

  done();
};
