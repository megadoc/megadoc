var path = require('path');
var corePlugin = require('../');
var Compiler = require('../../../lib/Compiler');
var assert = require('chai').assert;

describe('plugins::core', function() {
  it('works', function() {
    var compiler = new Compiler({
      tmpDir: path.resolve(__dirname, '..', '..', '..', 'tmp'),
      plugins: []
    });

    assert.doesNotThrow(function() {
      corePlugin.run(compiler);
    });
  });

  it('testRouter', function(done) {
    corePlugin.testRouter(function(err) {
      done(err);
    });
  });
});
