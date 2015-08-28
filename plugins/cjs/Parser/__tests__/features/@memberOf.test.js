var assert = require('assert');
var TestUtils = require('../../TestUtils');
var K = require('../../constants');

describe('CJS::Parser - @memberOf support', function() {
  it('correctly adjusts the receiver to the specified one', function() {
    var docs = TestUtils.parseInline(function() {
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

  context('when the specified receiver @lends to something else', function() {
    it('adjusts the receiver to whatever the receiver lent to', function() {
      var docs = TestUtils.parseInline(function() {
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
