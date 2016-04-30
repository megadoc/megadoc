var AssetUtils = require('../AssetUtils');
var assert = require('assert');

describe('AssetUtils', function() {
  describe('#getAssetPath', function() {
    it('works with a single path fragment', function() {
      var subject = AssetUtils({ assetRoot: '/tmp' });

      assert.equal(subject.getAssetPath('foo'), '/tmp/foo');
    });

    it('works with multiple path fragments', function() {
      var subject = AssetUtils({ assetRoot: '/tmp' });

      assert.equal(subject.getAssetPath('foo', 'bar'), '/tmp/foo/bar');
    });
  });

  describe('#getOutputPath', function() {
    it('works with a single path fragment', function() {
      var subject = AssetUtils({ outputDir: '/tmp' });

      assert.equal(subject.getOutputPath('foo'), '/tmp/foo');
    });

    it('works with multiple path fragments', function() {
      var subject = AssetUtils({ outputDir: '/tmp' });

      assert.equal(subject.getOutputPath('foo', 'bar'), '/tmp/foo/bar');
    });
  });

  describe('.arrayWrap', function() {
    var subject = AssetUtils.arrayWrap;

    it('should work with an undefined value', function() {
      assert.deepEqual(subject(), []);
    });

    it('should leave an array value as is', function() {
      var arr = [];
      assert.equal(subject(arr), arr);
    });

    it('should wrap a scalar', function() {
      var v = 'a';
      assert.deepEqual(subject(v), [ v ]);
    });

    it('should wrap a boolean', function() {
      var v = false;
      assert.deepEqual(subject(v), [ false ]);
    });
  });
});
