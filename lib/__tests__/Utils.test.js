var Utils = require('../Utils');
var assert = require('assert');

describe('Utils', function() {
  describe('#getAssetPath', function() {
    it('works with a single path fragment', function() {
      var subject = Utils({ assetRoot: '/tmp' });

      assert.equal(subject.getAssetPath('foo'), '/tmp/foo');
    });

    it('works with multiple path fragments', function() {
      var subject = Utils({ assetRoot: '/tmp' });

      assert.equal(subject.getAssetPath('foo', 'bar'), '/tmp/foo/bar');
    });
  });

  describe('#getOutputPath', function() {
    it('works with a single path fragment', function() {
      var subject = Utils({ outputDir: '/tmp' });

      assert.equal(subject.getOutputPath('foo'), '/tmp/foo');
    });

    it('works with multiple path fragments', function() {
      var subject = Utils({ outputDir: '/tmp' });

      assert.equal(subject.getOutputPath('foo', 'bar'), '/tmp/foo/bar');
    });
  });
});
