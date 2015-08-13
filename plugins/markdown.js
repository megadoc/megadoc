var path = require('path');

exports.name = 'markdown';
exports.defaults = require('../defaults')['markdown'];
exports.register = function(tiny, config) {
  tiny.registerScanner(require('../scanners/markdown'));
  tiny.registerWriter(require('../writers/markdown'));
  tiny.registerReporterPlugin(exports.defaults, {
    stylesheet: path.resolve(__dirname, '..', 'ui', 'plugins', 'markdown', 'css', 'index.less'),
    files: [
      './plugins/markdown-config.js',
    ]
  });
};
