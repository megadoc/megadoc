var extend = require('lodash').extend;
var PluginManager = require('./lib/PluginManager');
var Utils = require('./lib/Utils');

var scan = require('./lib/tinydoc.scan');
var write = require('./lib/tinydoc.write');

var defaults = {
  plugins: []
};

function tinydoc(userConfig) {
  var config = extend({}, defaults, userConfig);
  var utils = new Utils(config);
  var pluginMgr = new PluginManager((config.plugins), config);

  return {
    config: config,

    run: function(done) {
      scan(pluginMgr.getScanners(), config, utils, function(database) {
        write(pluginMgr.getWriters(), pluginMgr, database, config, utils, function(err) {
          if (err) {
            return done(err, null);
          }

          done(null, database);
        });
      });
    },

    utils: utils
  };
};

module.exports = tinydoc;
