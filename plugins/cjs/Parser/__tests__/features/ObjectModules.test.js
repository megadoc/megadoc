var assert = require('assert');
var TestUtils = require('../../TestUtils');
var parseInline = TestUtils.parseInline;

describe('CJS::Parser - Object modules', function() {
  it('parses static functions', function() {
    var docs = parseInline(function() {
      // /** @module */
      // var DragonHunter = {};
      //
      // /**
      //  * Capture a dragon.
      //  */
      // DragonHunter.capture = function() {
      // };
    });

    assert.equal(docs.length, 2);
    assert.equal(docs[1].ctx.type, 'function');
    assert.equal(docs[1].id, 'capture');
    assert.equal(docs[1].receiver, 'DragonHunter');
  });

  it('parses static properties', function() {
    var docs = parseInline(function() {
      // /** @module */
      // var DragonHunter = {};
      //
      // /**
      //  * Capture a dragon.
      //  */
      // DragonHunter.someProperty = 'a';
    });

    assert.equal(docs.length, 2);
    assert.equal(docs[1].ctx.type, 'literal');
    assert.equal(docs[1].name, 'someProperty');
    assert.equal(docs[1].receiver, 'DragonHunter');
    assert.equal(docs[1].ctx.value, 'a');
  });

  it('parses static properties with an ObjectExpression value', function() {
    var docs = parseInline(function() {
      // /** @module */
      // var DragonHunter = {};
      //
      // /**
      //  * All the dragons that be.
      //  */
      // DragonHunter.someProperty = {
      // };
    });

    assert.equal(docs.length, 2);
    assert.equal(docs[1].ctx.type, 'object');
    assert.equal(docs[1].name, 'someProperty');
    assert.equal(docs[1].receiver, 'DragonHunter');
    assert.deepEqual(docs[1].ctx.properties, []);
  });
});
