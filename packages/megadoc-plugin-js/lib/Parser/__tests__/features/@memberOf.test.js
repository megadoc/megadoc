var assert = require('assert');
var TestUtils = require('../../TestUtils');
var K = require('../../constants');
var MegaTestUtils = require('megadoc/lib/TestUtils');
var multiline = require('multiline-slash');

describe('CJS::Parser - @memberOf support', function() {
  this.timeout(20000);

  it('correctly adjusts the receiver to the specified one', function() {
    var docs = TestUtils.parseInline(function() {;
      // /** @module */
      // var DragonHunter = {};
      //
      // /** @memberOf DragonHunter */
      // function capture() {}
    });

    assert.equal(docs.length, 2);
    assert.equal(docs[1].type, K.TYPE_FUNCTION);
    assert.equal(docs[1].name, 'capture');
    assert.equal(docs[1].receiver, 'DragonHunter');
  });

  it('resolves the correct module even if it is namespaced and the tag omits it', function() {
    var docs = TestUtils.parseInline(function() {;
      // /**
      //  * @module
      //  * @namespace API
      //  */
      // var DragonHunter = {};
      //
      // /** @memberOf DragonHunter */
      // function capture() {}
    });

    assert.equal(docs.length, 2);
    assert.equal(docs[1].type, K.TYPE_FUNCTION);
    assert.equal(docs[1].name, 'capture');
    assert.equal(docs[1].receiver, 'API.DragonHunter');
  });

  context('when the target is a prototype...', function() {
    var docs;

    before(function() {
      docs = TestUtils.parseInline(function() {;
        // /** @module */
        // var DragonHunter = {};
        //
        // /** @memberOf DragonHunter.prototype */
        // function capture() {}
      });

      assert.equal(docs.length, 2);
    });

    it('omits ".prototype" from the receiver', function() {
      assert.equal(docs[1].name, 'capture');
      assert.equal(docs[1].receiver, 'DragonHunter');
    });

    it('adjusts the scope so that it is "SCOPE_PROTOTYPE"', function() {
      assert.equal(docs[1].nodeInfo.scope, K.SCOPE_PROTOTYPE);
    });
  });

  context('when the target is aliased...', function() {
    var docs;

    before(function() {
      docs = TestUtils.parseInline(function() {;
        // /**
        //  * @module
        //  * @alias Foo
        //  */
        // var DragonHunter = {};
        //
        // /** @memberOf Foo */
        // function capture() {}
      });

      assert.equal(docs.length, 2);
    });

    it('uses the original target name as the receiver', function() {
      assert.equal(docs[1].name, 'capture');
      assert.equal(docs[1].receiver, 'DragonHunter');
    });
  });

  context('when the target is CommonJS "exports"...', function() {
    var docs;

    before(function() {
      docs = TestUtils.parseInline(function() {;
        // /** @module */
        // var DragonHunter = eexports;
        //
        // /** @memberOf DragonHunter */
        // function capture() {}
      });

      assert.equal(docs.length, 2);
    });

    it('resolves the identifier assigned to "exports" as the receiver', function() {
      assert.equal(docs[1].name, 'capture');
      assert.equal(docs[1].receiver, 'DragonHunter');
    });
  });

  it('works with something like Object.defineProperty and @property', function() {
    var docs = TestUtils.parseInline(function() {;
      // /** @module */
      // var DragonHunter = {};
      //
      // Object.defineProperty(DragonHunter, 'node', {
      //   /**
      //    * @memberOf DragonHunter.prototype
      //    *
      //    * @property {String} node
      //    */
      //   get: function() {
      //     return 'asdfasdf';
      //   }
      // });
    });

    assert.equal(docs.length, 2);
    assert.equal(docs[1].name, 'node');
    assert.equal(docs[1].receiver, 'DragonHunter');
    assert.equal(docs[1].type, 'String');
    assert.equal(docs[1].symbol, '@');
    assert.equal(docs[1].nodeInfo.scope, K.SCOPE_PROTOTYPE);
  });

  context('when the specified receiver @lends to something else', function() {
    it('adjusts the receiver to whatever the receiver lent to', function() {
      var docs = TestUtils.parseInline(function() {;
        // /** @module */
        // var DragonHunter = {};
        //
        // /** @lends DragonHunter */
        // var DragonHunterAPI = {};
        //
        // /** @memberOf DragonHunterAPI */
        // function capture() {}
      });

      assert.equal(docs.length, 2);
      assert.equal(docs[1].type, K.TYPE_FUNCTION);
      assert.equal(docs[1].name, 'capture');
      assert.equal(docs[1].receiver, 'DragonHunter');
    });
  });

  context('when they are spread across multiple files', function() {
    var docs, file1, file2;

    beforeEach(function() {
      file1 = MegaTestUtils.createFile(multiline(function() {;
        // /** @module DOMSelectors */
        //
      }), 'module.js');

      file2 = MegaTestUtils.createFile(multiline(function() {;
        // /**
        //  * @memberOf DOMSelectors
        //  *
        //  */
        // function fn() {}
        //
        // module.exports = fn;
      }), 'module/fn.js');

      docs = TestUtils.parseFiles([ file1.path, file2.path ], {});

      assert.equal(docs.length, 2);
    });

    it('works', function() {
      var fnDoc = docs.filter(function(x) { return x.name === 'fn' })[0];

      assert.equal(fnDoc.type, K.TYPE_FUNCTION);
      assert.equal(fnDoc.name, 'fn');
      assert.equal(fnDoc.receiver, 'DOMSelectors');
    });
  });
});
