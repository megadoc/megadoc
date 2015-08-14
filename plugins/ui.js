var path = require('path');
var write = require('./ui/write');

module.exports = function(emitter, cssCompiler, scriptLoader, config, utils) {
  cssCompiler.addStylesheet(path.resolve(__dirname, '..', 'ui', 'app', 'css', 'index.less'));

  emitter.on('write', function(compilation, done) {
    write(config, scriptLoader, utils, done);
  });
};

module.exports.$inject = [ 'emitter', 'cssCompiler', 'scriptLoader', 'config', 'utils' ];