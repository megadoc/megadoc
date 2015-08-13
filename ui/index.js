exports.name = 'ui'
exports.defaults = require('./defaults');
exports.register = function(tiny, config) {
  tiny.registerWriter(require('../writers/ui'));
};
