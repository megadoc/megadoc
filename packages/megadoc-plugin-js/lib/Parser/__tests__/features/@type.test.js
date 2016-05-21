var TestUtils = require('../../TestUtils');
var K = require('../../constants');
var assert = require('chai').assert;

describe('CJS::Parser - @type support', function() {
  it('respects the @type specified even if no context was generated', function() {
    var docs = TestUtils.parseInline(function() {;
      // /**
      //  * @module flushPromiseQueue
      //  * @type {Function}
      //  */
      // module.exports = require('./setupRSVP').flush;
    });

    assert.equal(docs.length, 1);
    assert.include(docs[0].ctx.type, { name: K.TYPE_FUNCTION });
  });
});