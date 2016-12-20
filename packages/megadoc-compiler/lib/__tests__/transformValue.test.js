const { assert } = require('chai');
const subject = require('../transformValue');
const useNext = (a,b) => b;

describe('megadoc-compiler::utils::transformValue', function() {
  it('should transform primitives', function() {
    const nextValue = subject('bar', 'baz', useNext)

    assert.deepEqual(nextValue, 'baz');
  });

  describe('objects...', function() {
    it('should transform each described property of an object', function() {
      const nextValue = subject({
        name: 'foo',
      }, {
        name: 'bar'
      }, useNext)

      assert.deepEqual(nextValue, { name: 'bar' });
    });

    it('should leave undescribed properties of an object untouched', function() {
      const nextValue = subject({
        name: 'foo',
      }, {}, useNext)

      assert.deepEqual(nextValue, { name: 'foo' });
    })

    it('should not confuse RegExp-s for iterable objects', function() {
      const nextValue = subject({
        name: /foo/,
      }, {
        name: /bar/
      }, useNext)

      assert.deepEqual(nextValue, { name: /bar/ });
    })
  });

  describe('arrays...', function() {
    it('should transform each item of a list', function() {
      const nextValue = subject({
        items: [ 'a', 'b' ],
      }, {
        items: [ 'a', 'c' ],
      }, useNext)

      assert.deepEqual(nextValue.items, [ 'a', 'c' ]);
    });
  });
});