exports.name = 'ui'
exports.defaults = require('../defaults').ui;
exports.register = function(tiny, config) {
  tiny.registerWriter(require('../writers/ui'));
};
