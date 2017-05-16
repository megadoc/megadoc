var assert = require('assert');
var TestUtils = require('../../TestUtils');
var K = require('../../constants');
var parseInline = TestUtils.parseInline;
const { stubConsoleWarn } = require('megadoc-test-utils');

describe('CJS::Parser - ES6 - export statements', function() {
  it.only('works with `export default function() {}`', function() {
    // stubConsoleWarn('No identifier was found')
    var docs = parseInline(function() {;
      // /**
      //  * Hi!
      //  */
      // export default function(textSelection, width) {
      // };
    }, {
      parserOptions: {
      },
      debug: true,
      verbose: true,
      inferModuleIdFromFileName: true,
    });

    console.log(docs[0])
    assert.equal(docs.length, 1);
    assert.equal(docs[0].type, K.TYPE_FUNCTION);
    assert.ok(docs[0].isModule);
  });
});
