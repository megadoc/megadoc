var assert = require('assert');
var TestUtils = require('../../TestUtils');
var parseInline = TestUtils.parseInline;

describe('CJS::Parser - @name support', function() {
  it('should override a module id', function() {
    var docs = parseInline(function() {;
      // /**
      //  * @name Foo
      //  * @module
      //  */
      // var Cache = {};
    });

    assert.equal(docs.length, 1);
    assert.equal(docs[0].name, 'Foo');
  });

  it('should not infer a namespace from it', function() {
    var docs = parseInline(function() {;
      // /**
      //  * @name Foo.Bar
      //  * @module
      //  */
      // var Cache = {};
    });

    assert.equal(docs.length, 1);
    assert.equal(docs[0].name, 'Foo.Bar');
    assert.equal(docs[0].namespace, undefined);
  });
});