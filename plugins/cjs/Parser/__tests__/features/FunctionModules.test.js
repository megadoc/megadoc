var assert = require('assert');
var TestUtils = require('../../TestUtils');
var findWhere = require('lodash').findWhere;
var parseInline = TestUtils.parseInline;

describe('CJS::Parser - Function modules', function() {
  it('parses static methods', function() {
    var doc;
    var docs = parseInline(function() {
      // /** @module */
      // var DragonHunter = function() {
      // };
      //
      // /**
      //  * Do something.
      //  */
      // DragonHunter.someFunction = function() {};
    });

    assert.equal(docs.length, 2);

    doc = findWhere(docs, { id: 'someFunction' });

    assert.ok(doc);
    assert.equal(doc.ctx.type, 'function');
    assert.equal(doc.receiver, 'DragonHunter');
  });

  it('parses static properties', function() {
    var doc;
    var docs = parseInline(function() {
      // /** @module */
      // var DragonHunter = function() {
      // };
      //
      // /**
      //  * Do something.
      //  */
      // DragonHunter.SOME_PROP = 'a';
    });

    assert.equal(docs.length, 2);

    doc = findWhere(docs, { id: 'SOME_PROP' });

    assert.ok(doc);
    assert.equal(doc.ctx.type, 'literal');
    assert.equal(doc.receiver, 'DragonHunter');
  });
});
