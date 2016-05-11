var subject = require("../findCommonPrefix");
var assert = require('assert');

describe('utils::findCommonPrefix', function() {
  it('should work', function() {
    var paths = [
      '/foo/bar/a.js',
      '/foo/bar/b.js',
      '/foo/bar/baz/c.js',
    ];

    assert.equal(subject(paths), '/foo/bar/');
  });

  it('should accept a custom delimiter', function() {
    var paths = [
      'foo:bar:a.js',
      'foo:bar:b.js',
      'foo:bar:baz:c.js',
    ];

    assert.equal(subject(paths, ':'), 'foo:bar:');
  });
});