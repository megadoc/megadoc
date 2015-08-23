var subject = require("../arrayWrap");
var assert = require('assert');

describe('utils::arrayWrap', function() {
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
});