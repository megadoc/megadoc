var assert = require('assert');
var findWhere = require('lodash').findWhere;
var TestUtils = require('../TestUtils');
var K = require('../constants');

var parseInline = TestUtils.parseInline;

describe('CJS::Parser', function() {
  it('should ignore @internal docs', function() {
    var docs = parseInline(function() {
      // /**
      //  * @internal
      //  * Something.
      //  */
      //  function Something() {
      //  }
      //
      //  module.exports = Something;
    });

    assert.equal(docs.length, 0);
  });

  describe('resolving identifiers', function() {
    it('resolves an Identifier to a function', function() {
      var docs = parseInline(function() {
        // /** @module */
        // var DragonHunter = function() {
        //   var scan = function(a, b) {
        //   };
        //
        //   return {
        //     /** Hi */
        //     scan: scan
        //   };
        // };
      });

      assert.equal(docs.length, 2);

      var doc = findWhere(docs, { name: 'scan' });

      assert.equal(doc.ctx.type, K.TYPE_FUNCTION);
      assert.equal(doc.receiver, 'DragonHunter');
      assert.equal(doc.ctx.scope, K.SCOPE_FACTORY_EXPORTS);
      assert.equal(doc.description, "Hi");
    });

    it('resolves an Identifier to a variable', function() {
      var docs = parseInline(function() {
        // /** @module */
        // var DragonHunter = function() {
        //   var scan = 5;
        //
        //   return {
        //     /** Hi */
        //     scan: scan
        //   };
        // };
      });

      assert.equal(docs.length, 2);

      var doc = findWhere(docs, { name: 'scan' });

      assert.equal(doc.ctx.type, K.TYPE_LITERAL);
      assert.equal(doc.receiver, 'DragonHunter');
      assert.equal(doc.ctx.scope, K.SCOPE_FACTORY_EXPORTS);
      assert.equal(doc.description, "Hi");
    });
  });
});