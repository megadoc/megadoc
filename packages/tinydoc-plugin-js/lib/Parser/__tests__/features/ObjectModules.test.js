var assert = require('assert');
var TestUtils = require('../../TestUtils');
var path = require('path');
var parseInline = TestUtils.parseInline;

describe('CJS::Parser - Object modules', function() {
  it('parses static functions', function() {
    var docs = parseInline(function() {;
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
    var docs = parseInline(function() {;
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
    var docs = parseInline(function() {;
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

  it('does not confuse tokens with ones defined in another file', function() {
    var docs = TestUtils.parseFiles([
      path.resolve(__dirname, '../../../config.js'),
      path.resolve(__dirname, '../../../Parser/NodeAnalyzer/analyzeNode.js'),
    ]);

    assert.ok(docs.length > 0);

    var doc = docs.filter(function(d) {
      return d.id === 'analyzeNode';
    })[0];

    assert.ok(doc);
    assert.ok(!!doc.receiver);
  });
});
