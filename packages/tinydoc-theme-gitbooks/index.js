var path = require('path');

module.exports = function() {
  return {
    run: function(compiler) {
      compiler.on('write', function(done) {
        compiler.assets.addStyleSheet(path.resolve(__dirname, 'index.less'));

        done();
      });
    }
  }
}