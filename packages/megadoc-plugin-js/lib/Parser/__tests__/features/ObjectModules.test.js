var assert = require('assert');
var TestUtils = require('../../TestUtils');
var path = require('path');
var K = require('../../constants');
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
    assert.equal(docs[1].id, 'DragonHunter.capture');
    assert.equal(docs[1].type, K.TYPE_FUNCTION);
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
    assert.equal(docs[1].type, K.TYPE_LITERAL);
    assert.equal(docs[1].name, 'someProperty');
    assert.equal(docs[1].receiver, 'DragonHunter');
    assert.equal(docs[1].nodeInfo.value, 'a');
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
    assert.equal(docs[1].type, K.TYPE_OBJECT);
    assert.equal(docs[1].name, 'someProperty');
    assert.equal(docs[1].receiver, 'DragonHunter');
    assert.deepEqual(docs[1].nodeInfo.properties, []);
  });

  it.skip('does not confuse tokens with ones defined in another file', function() {
    var docs = TestUtils.parseFiles([
      // oh WTF? come on
      path.resolve(__dirname, '../../../config.js'),
      path.resolve(__dirname, '../../../Parser/NodeAnalyzer/analyzeNode.js'),
    ]);

    assert.ok(docs.length > 0);

    var doc = docs.filter(function(d) {
      return d.id === 'Config@analyzeNode';
    })[0];

    assert.ok(doc);
    assert.equal(doc.receiver, 'Config');
  });
});
