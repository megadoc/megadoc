var extend = require('lodash').extend;

module.exports = function(database, config, utils, done) {
  var runtimeConfig = extend({}, config, { database: database });

  try {
    utils.writeAsset(
      'plugins/cjs-config.js',
      'window["cjs-config"]=' + JSON.stringify(runtimeConfig) + ';'
    );

    done();
  }
  catch(e) {
    if (e.name === 'TypeError' && e.message.match(/circular/)) {
      console.error(runtimeConfig);
    }

    throw e;
  }

};
