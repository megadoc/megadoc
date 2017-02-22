const { assert } = require('chai');
const subject = require('../reduceTreeFn');
const b = require('megadoc-corpus').builders;

describe('megadoc-plugin-js::reduceTreeFn', function() {
  const defaultContext = {
    commonOptions: {},
    options: {},
  };

  it('wires entities to their parents', function() {
    const documents = [
      b.document({
        id: 'truck',
        title: 'truck',
        properties: {
          isModule: true
        }
      }),

      b.documentEntity({
        id: '#beep',
        properties: {
          receiver: 'truck'
        }
      })
    ];

    const treeOperations = subject(defaultContext, documents)

    assert.equal(treeOperations.length, 2);
    assert.include(treeOperations[1].data, {
      id: '#beep',
      parentId: 'truck'
    });
  });

  it('wires documents nested inside namespaces to their namespace nodes', function() {
    const documents = [
      b.document({
        id: 'MyNamespace',
        properties: {}
      }),

      b.document({
        id: 'truck',
        title: 'truck',
        properties: {
          namespace: 'MyNamespace',
          isModule: true
        }
      }),
    ];

    const treeOperations = subject(defaultContext, documents)

    assert.equal(treeOperations.length, 2);
    assert.include(treeOperations[1].data, {
      id: 'truck',
      parentId: 'MyNamespace'
    });
  });
});