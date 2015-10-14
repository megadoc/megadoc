var corePlugin = require('../');
var assert = require('chai').assert;

describe('plugins::core', function() {
  it('works', function() {
    var compiler = TestUtils.createCompiler();

    assert.doesNotThrow(function() {
      corePlugin.run(compiler);
    });
  });
});
