var assert = require('assert');
var TestUtils = require('../../TestUtils');
var K = require('../../constants');
var parseInline = TestUtils.parseInline;

describe('CJS::Parser - ES6 - defaultValues', function() {
  it('works with `function x(param = 5) {}`', function() {
    var docs = parseInline(function() {;
      // /** @module */
      // function DragonHunter(param = 5) {
      // }
    });

    assert.equal(docs.length, 1);
    assert.equal(docs[0].ctx.type, K.TYPE_FUNCTION);
  });

  it('works with default values assigned to destructured object `function x({ param = 5 }) {}`', function() {
    var docs = parseInline(function() {;
      // /** @module */
      // function DragonHunter({ param = 5 }) {
      // }
    });

    assert.equal(docs.length, 1);
    assert.equal(docs[0].ctx.type, K.TYPE_FUNCTION);
  });
});
