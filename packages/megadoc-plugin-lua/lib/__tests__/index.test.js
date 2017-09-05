const { assert } = require('megadoc-test-utils');
const parseFn = require('../parseFn');
const reduceTreeFn = require('../reduceTreeFn');
const FileSuite = require('megadoc-test-utils/FileSuite');
const b = require('megadoc-corpus').builders;

describe('megadoc-plugin-lua::parseFn', function() {
  const fileSuite = FileSuite(this);

  it('works', function(done) {
    const sourceFile = fileSuite.createFile('source.lua', ``);
    parseFn({ compilerOptions: {}, options: {} }, sourceFile.path, done)
  });
})

describe('megadoc-plugin-lua::reduceTreeFn', function() {
  it('works', function() {
    const config = { compilerOptions: {}, options: {} };
    const documents = [
      b.document({
        id: 'foo',
        properties: {}
      }),

      b.documentEntity({
        id: 'x',
        properties: {
          receiver: 'foo'
        }
      })
    ];

    const treeOperations = reduceTreeFn(config, documents);
    const changeParentOps = treeOperations.filter(x => x.type === 'CHANGE_NODE_PARENT')

    assert.equal(changeParentOps.length, 1);
    assert.include(changeParentOps[0], {
      type: 'CHANGE_NODE_PARENT'
    })

    assert.include(changeParentOps[0].data, {
      id: documents[1].id,
      parentId: documents[0].id,
    })
  });
})