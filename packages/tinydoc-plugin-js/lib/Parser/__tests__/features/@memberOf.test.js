var assert = require('assert');
var TestUtils = require('../../TestUtils');
var K = require('../../constants');

describe('CJS::Parser - @memberOf support', function() {
  it('correctly adjusts the receiver to the specified one', function() {
    var docs = TestUtils.parseInline(function() {;
      // /** @module */
      // var DragonHunter = {};
      //
      // /** @memberOf DragonHunter */
      // function capture() {}
    });

    assert.equal(docs.length, 2);
    assert.equal(docs[1].ctx.type, K.TYPE_FUNCTION);
    assert.equal(docs[1].name, 'capture');
    assert.equal(docs[1].receiver, 'DragonHunter');
  });

  it('works with a Something.prototype', function() {
    var docs = TestUtils.parseInline(function() {;
      // /** @module */
      // var DragonHunter = {};
      //
      // /** @memberOf DragonHunter.prototype */
      // function capture() {}
    });

    assert.equal(docs.length, 2);
    assert.equal(docs[1].name, 'capture');
    assert.equal(docs[1].receiver, 'DragonHunter');
    assert.equal(docs[1].ctx.type, K.TYPE_FUNCTION);
    assert.equal(docs[1].ctx.scope, K.SCOPE_PROTOTYPE);
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
    assert.equal(docs[1].ctx.type, K.TYPE_UNKNOWN);
    assert.equal(docs[1].ctx.scope, K.SCOPE_PROTOTYPE);
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
      assert.equal(docs[1].ctx.type, K.TYPE_FUNCTION);
      assert.equal(docs[1].name, 'capture');
      assert.equal(docs[1].receiver, 'DragonHunter');
    });
  });
});
