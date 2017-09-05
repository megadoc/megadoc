require('../Compiler')
const { assert } = require('megadoc-test-utils');
const composeTree = require('../stage03__composeTree');
const { builders: b } = require('megadoc-corpus')

describe('megadoc-compiler::composeTree', function() {
  const subject = composeTree;
  const compilerOptions = { strict: true };

  describe('CHANGE_NODE_PARENT', function() {
    it('maps a DocumentEntity to a Document', function() {
      const tree = subject({
        id: 'foo',
        compilerOptions,
        documents: [
          b.document({
            id: 'Klass'
          }),
          b.documentEntity({
            id: 'Method',
          })
        ],
        treeOperations: [
          {
            type: 'CHANGE_NODE_PARENT',
            data: {
              parentId: 'Klass',
              id: 'Method',
            },
          }
        ]
      })

      assert.equal(tree.documents.length, 1)
      assert.equal(tree.documents[0].id, 'Klass')
      assert.equal(tree.documents[0].entities.length, 1)
      assert.equal(tree.documents[0].entities[0].id, 'Method')
    });

    it('maps a Document to a Document', function() {
      const tree = subject({
        id: 'foo',
        compilerOptions,
        documents: [
          b.document({ id: 'Container' }),
          b.document({ id: 'Klass' })
        ],
        treeOperations: [
          {
            type: 'CHANGE_NODE_PARENT',
            data: {
              id: 'Klass',
              parentId: 'Container',
            },
          }
        ]
      })

      assert.equal(tree.documents.length, 1)
      assert.equal(tree.documents[0].id, 'Container')
      assert.equal(tree.documents[0].documents.length, 1)
      assert.equal(tree.documents[0].documents[0].id, 'Klass')
    });

    it('whines if a parent could not be found', function() {
      assert.throws(function() {
        subject({
          id: 'foo',
          compilerOptions,
          documents: [
            b.document({
              id: 'Klass'
            })
          ],
          treeOperations: [
            {
              type: 'CHANGE_NODE_PARENT',
              data: {
                id: 'Klass',
                parentId: 'Container',
              },
            }
          ]
        })
      }, /Node with the id "Container" specified as a parent for node "Klass" could not be found./)
    });

    it('whines if the node could not be found', function() {
      assert.throws(function() {
        subject({
          id: 'foo',
          compilerOptions,
          documents: [
            b.document({
              id: 'Klass'
            })
          ],
          treeOperations: [
            {
              type: 'CHANGE_NODE_PARENT',
              data: {
                id: 'Child',
                parentId: 'Klass',
              },
            }
          ]
        })
      }, /Node with the id "Child" specified as a child for node "Klass" could not be found./)
    });
  })
});