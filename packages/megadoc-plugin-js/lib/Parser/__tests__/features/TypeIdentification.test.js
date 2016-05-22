var assert = require('assert');
var TestUtils = require('../../TestUtils');
var K = require('../../constants');
var parseInline = TestUtils.parseInline;

describe('CJS::Parser - Type Identification', function() {
  it('marks `var SomeModule = {};` as an `object`', function() {
    var docs = parseInline(function() {;
      // /** @module */
      // var DragonHunter = {};
    });

    assert.equal(docs.length, 1);
    assert.equal(docs[0].ctx.type, K.TYPE_OBJECT);
  });

  it('marks `var SomeModule = function {};` as a `function`', function() {
    var docs = parseInline(function() {;
      // /** @module */
      // var DragonHunter = function() {};
    });

    assert.equal(docs.length, 1);
    assert.equal(docs[0].ctx.type, K.TYPE_FUNCTION);
  });

  it('marks `function SomeModule() {}` as a `function`', function() {
    var docs = parseInline(function() {;
      // /** @module */
      // function DragonHunter() {}
    });

    assert.equal(docs.length, 1);
    assert.equal(docs[0].ctx.type, K.TYPE_FUNCTION);
  });

  it('marks `class SomeModule {}` as a `class`', function() {
    var docs = parseInline(function() {;
      // /** @module */
      // class DragonHunter {
      // }
    });

    assert.equal(docs.length, 1);
    assert.equal(docs[0].ctx.type, K.TYPE_CLASS);
  });
});
