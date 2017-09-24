const TestUtils = require('../../TestUtils');
const K = require('../../constants');
const parseInline = TestUtils.parseInline;
const { assert } = require('megadoc-test-utils');

describe('CJS::Parser - ES6 - export statements', function() {
  const parserOptions = {
    presets: [ [require.resolve('babel-preset-es2015'), { modules: false}] ],
    babelrc: false
  };

  it('works with `export default function() {}`', function() {
    var docs = parseInline(function() {;
      // /**
      //  * Hi!
      //  */
      // export default function foo(textSelection, width) {
      // };
    }, { parserOptions, }, 'myModule.js');

    assert.equal(docs.length, 1);
    assert.equal(docs[0].name, 'foo');
    assert.equal(docs[0].type, K.TYPE_FUNCTION);
    assert.ok(docs[0].isExportedSymbol);
    assert.ok(docs[0].isDefaultExportedSymbol);
    assert.ok(docs[0].isModule);
  });

  it('works with `export function foo() {}`', function() {
    var docs = parseInline(function() {;
      // /**
      //  * Hi!
      //  */
      // export function foo(textSelection, width) {
      // };
    }, { parserOptions, }, 'myModule.js');

    assert.equal(docs.length, 1);
    assert.equal(docs[0].name, 'foo');
    assert.equal(docs[0].type, K.TYPE_FUNCTION);
    assert.equal(docs[0].receiver, 'myModule');
    assert.ok(docs[0].isExportedSymbol);
    assert.notOk(docs[0].isModule);
  });

  it('works with ExportSpecifier `export { default as foo } from "./bar"`', function() {
    var docs = parseInline(function() {;
      // export { /** hi ! */ default as foo } from './bar'
    }, { parserOptions, }, 'myModule.js');

    assert.equal(docs.length, 1);
    assert.equal(docs[0].name, 'foo');
    assert.equal(docs[0].type, K.TYPE_UNKNOWN);
    assert.equal(docs[0].receiver, 'myModule');
    assert.ok(docs[0].isExportedSymbol);
    assert.notOk(docs[0].isModule);
  });

  it('uses the first (default) specifier in `export { default as foo } from "./bar"`', function() {
    var docs = parseInline(function() {;
      // /** hi ! */
      // export { default as foo } from './bar'
    }, { parserOptions, }, 'myModule.js');

    assert.equal(docs.length, 1);
    assert.equal(docs[0].name, 'foo');
    assert.equal(docs[0].type, K.TYPE_UNKNOWN);
    assert.equal(docs[0].receiver, 'myModule');
    assert.ok(docs[0].isExportedSymbol);
    assert.notOk(docs[0].isModule);
  });

  it('works with ExportSpecifier `export { foo } from "./bar"`', function() {
    var docs = parseInline(function() {;
      // export { /** hi ! */ foo } from './bar'
    }, { parserOptions, }, 'myModule.js');

    assert.equal(docs.length, 1);
    assert.equal(docs[0].name, 'foo');
    assert.equal(docs[0].type, K.TYPE_UNKNOWN);
    assert.equal(docs[0].receiver, 'myModule');
    assert.ok(docs[0].isExportedSymbol);
    assert.notOk(docs[0].isModule);
  });

  it('uses the first specifier in `export { foo } from "./bar"`', function() {
    var docs = parseInline(function() {;
      // /** hi ! */
      // export { foo } from './bar'
    }, { parserOptions, }, 'myModule.js');

    assert.equal(docs.length, 1);
    assert.equal(docs[0].name, 'foo');
    assert.equal(docs[0].type, K.TYPE_UNKNOWN);
    assert.equal(docs[0].receiver, 'myModule');
    assert.ok(docs[0].isExportedSymbol);
    assert.notOk(docs[0].isModule);
  });

  it('uses the closest module doc for a receiver if present', function() {
    var docs = parseInline(function() {;
      // /** @module page-fu */
      //
      // /** @property {foo} */
      // export { foo } from './bar'
    }, { parserOptions }, 'myModule.js');

    assert.equal(docs.length, 2);
    assert.equal(docs[1].name, 'foo');
    assert.equal(docs[1].type, 'foo');
    assert.equal(docs[1].receiver, 'page-fu');
    assert.ok(docs[1].isExportedSymbol);
    assert.notOk(docs[1].isModule);
  });
});
