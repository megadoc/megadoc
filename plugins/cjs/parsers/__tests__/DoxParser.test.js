var DoxParser = require('../DoxParser');
var assert = require('assert');

function parse(filePath, options) {
  return DoxParser(TestUtils.getFixturePath(filePath), options || {});
}

describe('DoxParser', function() {
  describe('parsing a class with a static method', function() {
    beforeEach(function() {
      docs = parse('cjs/class_with_static_method.js');
      assert.equal(docs.length, 4);
    });

    it('should work with a static method that accepts no params', function() {
      assert.equal(docs[1].ctx.receiver, 'Core.Store');
      assert.ok(docs[1].isStatic);
    });

    it('should work with a static method that accepts params', function() {
      assert.equal(docs[2].ctx.receiver, 'Core.Store');
      assert.ok(docs[2].isStatic);
    });

    it('should work with a method marked @static', function() {
      assert.equal(docs[3].ctx.receiver, 'Core.Store');
      assert.ok(docs[3].isStatic);
    });
  });
});