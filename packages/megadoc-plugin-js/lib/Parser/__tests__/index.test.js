var assert = require('chai').assert;
var findWhere = require('lodash').findWhere;
var TestUtils = require('../TestUtils');
var K = require('../constants');
var sinonSuite = require('megadoc/lib/TestUtils').sinonSuite;

var parseInline = TestUtils.parseInline;

describe('CJS::Parser::Main', function() {
  var sinon = sinonSuite(this);

  it('should ignore @internal docs', function() {
    var docs = parseInline(function() {;
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

  it('should warn about invalid docstrings', function() {
    sinon.stub(console, 'warn');

    assert.throws(function() {
      parseInline(function() {;
        // /**
        //  * @internal
        //    Something.
        //  */
        //  function Something() {
        //  }
        //
        //  module.exports = Something;
      });
    }, /Invalid annotation in comment block/);
  });

  describe('resolving identifiers', function() {
    it('resolves an Identifier to a function', function() {
      var docs = parseInline(function() {;
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

      assert.equal(doc.type, K.TYPE_FUNCTION);
      assert.equal(doc.receiver, 'DragonHunter');
      assert.equal(doc.ctx.scope, K.SCOPE_FACTORY_EXPORTS);
      assert.equal(doc.description, "Hi");
    });

    it('resolves an Identifier to a variable', function() {
      var docs = parseInline(function() {;
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

      assert.equal(doc.type, K.TYPE_LITERAL);
      assert.equal(doc.receiver, 'DragonHunter');
      assert.equal(doc.ctx.scope, K.SCOPE_FACTORY_EXPORTS);
      assert.equal(doc.description, "Hi");
    });
  });

  describe('docstrings defined without nodes', function() {
    it('can parse a node-free docstring', function() {
      var docs = parseInline(function() {;
        // /** @module Something */
      });

      assert.equal(docs.length, 1);
      assert.equal(docs[0].id, 'Something');
      assert.equal(docs[0].type, K.TYPE_UNKNOWN);
      assert.equal(docs[0].isModule, true);
    });

    it('correctly maps entities to a node-free @module docstring', function() {
      var docs = parseInline(function() {;
        // /**
        //   * @module Something
        //   * @type {Object}
        //   */
        //
        // /** weehee */
        // exports.someFunc = function() {
        // };
        //
        // /** weehee */
        // exports.someProperty = '5';
      });

      assert.equal(docs.length, 3);

      assert.equal(docs[0].id, 'Something');
      assert.deepEqual(docs[0].type, K.TYPE_OBJECT);
      assert.equal(docs[0].isModule, true);

      assert.equal(docs[1].name, 'someFunc');
      assert.equal(docs[1].receiver, 'Something');
      assert.equal(docs[1].type, K.TYPE_FUNCTION);
      assert.equal(docs[1].ctx.scope, K.SCOPE_UNSCOPED);

      assert.equal(docs[2].name, 'someProperty');
      assert.equal(docs[2].receiver, 'Something');
      assert.equal(docs[2].type, K.TYPE_LITERAL);
    });
  });
});