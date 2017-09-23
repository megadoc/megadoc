const { assert } = require('megadoc-test-utils');
const reduceTreeFn = require('../reduceTreeFn');
const b = require('megadoc-corpus').builders;
const uidOf = (id, nodes) => nodes.filter(x => x.id === id).map(x => x.uid)[0]

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
      uid: uidOf('x', documents),
      parentUid: uidOf('foo', documents),
    })
  });
})
