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
          id: 'truck',
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
      parentUid: documents[0].uid,
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

  it('wires entities to documents nested inside namespaces', function() {
    const documents = [
      b.document({
        id: 'MyNamespace',
        properties: {}
      }),

      b.document({
        id: 'truck',
        title: 'truck',
        properties: {
          id: 'MyNamespace.truck',
          namespace: 'MyNamespace',
          isModule: true
        }
      }),

      b.documentEntity({
        id: 'beep',
        title: 'truck#beep',
        properties: {
          isModule: false,
          receiver: 'MyNamespace.truck'
        }
      })
    ];

    const treeOperations = subject(defaultContext, documents)

    assert.equal(treeOperations.length, 3);
    assert.include(treeOperations[2].data, {
      id: 'truck',
      parentId: 'MyNamespace'
    });

    assert.include(treeOperations[1].data, {
      id: 'beep',
      parentUid: documents[1].uid
    });
  });
});