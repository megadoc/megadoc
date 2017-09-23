require('../Compiler')
const { assert, createBuildersWithUIDs, uidOf } = require('megadoc-test-utils');
const composeTree = require('../stage03__composeTree');
const b = createBuildersWithUIDs(require('megadoc-corpus'));

describe('megadoc-compiler::composeTree', function() {
  const subject = composeTree;
  const compilerOptions = { strict: true };

  describe('CHANGE_NODE_PARENT', function() {
    it('maps a DocumentEntity to a Document', function() {
      const documents = [
        b.document({
          id: 'Klass'
        }),
        b.documentEntity({
          id: 'Method',
        })
      ]
      const tree = subject({
        id: 'foo',
        compilerOptions,
        documents,
        treeOperations: [
          {
            type: 'CHANGE_NODE_PARENT',
            data: {
              parentUid: uidOf('Klass', documents),
              uid: uidOf('Method', documents),
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
      const documents = [
        b.document({ id: 'Container' }),
        b.document({ id: 'Klass' })
      ];
      const tree = subject({
        id: 'foo',
        compilerOptions,
        documents,
        treeOperations: [
          {
            type: 'CHANGE_NODE_PARENT',
            data: {
              uid: uidOf('Klass', documents),
              parentUid: uidOf('Container', documents),
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
        const documents = [
          b.document({
            id: 'Klass'
          })
        ];

        subject({
          id: 'foo',
          compilerOptions,
          documents,
          treeOperations: [
            {
              type: 'CHANGE_NODE_PARENT',
              data: {
                uid: uidOf('Klass', documents),
                parentUid: uidOf('Container', documents),
              },
            }
          ]
        })
      }, /Node with UID ".+" specified as a parent for node ".+" could not be found./)
    });

    it('whines if the node could not be found', function() {
      assert.throws(function() {
        const documents = [
          b.document({
            id: 'Klass'
          })
        ];

        subject({
          id: 'foo',
          compilerOptions,
          documents,
          treeOperations: [
            {
              type: 'CHANGE_NODE_PARENT',
              data: {
                uid: uidOf('Child', documents),
                parentUid: uidOf('Klass', documents),
              },
            }
          ]
        })
      }, /Node with UID ".+" specified as a child for node ".+" could not be found./)
    });
  })
});