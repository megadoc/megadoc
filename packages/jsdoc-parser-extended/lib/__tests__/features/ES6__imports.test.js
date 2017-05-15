var assert = require('assert');
var TestUtils = require('../../TestUtils');
var K = require('../../constants');
var parseInline = TestUtils.parseInline;

describe('CJS::Parser - ES6 - import statements', function() {
  it('works with `function x(param = 5) {}`', function() {
    var docs = parseInline(function() {;
      // import { select } from 'd3-selection';
      //
      // /**
      //  * @module d3.truncateText
      //  *
      //  * Hi!
      //  */
      // module.exports = function truncateText(textSelection, width) {
      // };
    }, {
      parserOptions: {
        presets: [ 'es2015' ],
      },
      debug: true,
      verbose: true,
    });

    assert.equal(docs.length, 1);
    assert.equal(docs[0].type, K.TYPE_FUNCTION);
  });
});
