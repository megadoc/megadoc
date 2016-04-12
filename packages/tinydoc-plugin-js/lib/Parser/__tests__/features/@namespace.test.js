var assert = require('assert');
var TestUtils = require('../../TestUtils');
var parseInline = TestUtils.parseInline;

describe('CJS::Parser - @namespace support', function() {
  it('should include the namespace in the module id', function() {
    var docs = parseInline(function() {;
      // /**
      //  * @namespace Core
      //  * @module
      //  */
      // var Cache = {};
    });

    assert.equal(docs.length, 1);
    assert.equal(docs[0].id, 'Core.Cache');
  });

  it('should not include the namespace in a module name', function() {
    var docs = parseInline(function() {;
      // /**
      //  * @namespace Core
      //  * @module
      //  */
      // var Cache = {};
    });

    assert.equal(docs.length, 1);
    assert.equal(docs[0].name, 'Cache');
  });

  it('should work with a nested namespace', function() {
    var docs = parseInline(function() {;
      // /**
      //  * @namespace Core.Data
      //  * @module
      //  */
      // var Cache = {};
    });

    assert.equal(docs.length, 1);
    assert.equal(docs[0].name, 'Cache');
    assert.equal(docs[0].namespace, 'Core.Data');
    assert.equal(docs[0].id, 'Core.Data.Cache');
  });
});