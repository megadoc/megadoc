var path = require('path');

exports.name = 'cjs';
exports.defaults = require('../defaults')['cjs'];
exports.register = function(tiny, config) {
  tiny.registerScanner(require('../scanners/cjs'));
  tiny.registerWriter(require('../writers/cjs'));
  tiny.registerReporterPlugin({
    stylesheet: path.resolve(__dirname, '..', 'ui', 'plugins', 'cjs', 'css', 'index.less'),
    files: [
      'plugins/cjs-config.js',
      'plugins/cjs.js',
    ]
  });
};
