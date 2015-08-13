var path = require('path');

exports.name = 'yard-api';
exports.defaults = require('../defaults')['yard-api'];
exports.register = function(tiny, config) {
  tiny.registerScanner(require('../scanners/yard-api'));
  tiny.registerWriter(require('../writers/yard-api'));
  tiny.registerReporterPlugin(exports.defaults, {
    stylesheet: path.resolve(__dirname, '..', 'ui', 'plugins', 'yard-api', 'css', 'index.less'),
    files: [
      './plugins/yard-api-config.js',
    ]
  });
};
