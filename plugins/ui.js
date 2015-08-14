var path = require('path');
var write = require('./ui/write');

module.exports = function(emitter, cssCompiler, config, utils) {
  cssCompiler.addStylesheet(path.resolve(__dirname, '..', 'ui', 'app', 'css', 'index.less'));

  emitter.on('write', function(compilation, done) {
    write(config, utils, done);
  });
};

module.exports.$inject = [ 'emitter', 'cssCompiler', 'config', 'utils' ];