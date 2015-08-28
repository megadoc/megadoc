var assert = require('assert');
var TestUtils = require('../../TestUtils');
var K = require('../../constants');
var findWhere = require('lodash').findWhere;
var parseInline = TestUtils.parseInline;

describe('CJS::Parser - Prototypal modules', function() {
  it('parses properties assigned to `this`', function() {
    var doc;
    var docs = parseInline(function() {
      // /** @module */
      // function DragonHunter() {
      //   /**
      //    * @property {String}
      //    *           Hi!
      //    */
      //   this.someProperty = 'a';
      // }
    });

    assert.equal(docs.length, 2);

    doc = findWhere(docs, { name: 'someProperty' });

    assert.ok(doc);
    assert.equal(doc.receiver, 'DragonHunter');
    assert.equal(doc.ctx.type, 'literal');
    assert.equal(doc.ctx.scope, K.SCOPE_INSTANCE);
  });

  it('parses prototype methods', function() {
    var doc;
    var docs = parseInline(function() {
      // /** @module */
      // function DragonHunter() {}
      //
      // /**
      //  * Do something.
      //  */
      // DragonHunter.prototype.someMethod = function() {};
    });

    assert.equal(docs.length, 2);

    doc = findWhere(docs, { id: 'someMethod' });

    assert.ok(doc);
    assert.equal(doc.ctx.type, 'function');
    assert.equal(doc.receiver, 'DragonHunter');
    assert.equal(doc.ctx.scope, K.SCOPE_PROTOTYPE);
  });

  it('parses prototype properties', function() {
    var doc;
    var docs = parseInline(function() {
      // /** @module */
      // function DragonHunter() {}
      //
      // /**
      //  * Do something.
      //  */
      // DragonHunter.prototype.someProperty = 'a';
    });

    assert.equal(docs.length, 2);

    doc = findWhere(docs, { id: 'someProperty' });

    assert.ok(doc);
    assert.equal(doc.ctx.type, 'literal');
    assert.equal(doc.receiver, 'DragonHunter');
    assert.equal(doc.ctx.scope, K.SCOPE_PROTOTYPE);
  });
});
