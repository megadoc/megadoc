const { assert } = require('chai');
const Subject = require('../TreeComposer');
const { builders: b } = require('megadoc-corpus')

describe('megadoc-compiler::TreeComposer', function() {
  describe('.composeTree', function() {
    const subject = Subject.composeTree;

    it('should distribute each file to it', function() {
      const tree = subject({
        options: {
          id: 'foo',
          name: 'Foo',
        }
      }, [
        b.document({
          id: 'Klass'
        }),
        b.documentEntity({
          id: 'Method',
        })
      ], [
        {
          type: 'CHANGE_NODE_PARENT',
          data: {
            parentId: 'Klass',
            id: 'Method',
          },
        }
      ])


      assert.equal(tree.documents.length, 1)
      assert.equal(tree.documents[0].id, 'Klass')
      assert.equal(tree.documents[0].entities.length, 1)
      assert.equal(tree.documents[0].entities[0].id, 'Method')
    });
  });

  describe('.mergeTrees', function() {
    const subject = Subject.mergeTrees;

    it('should use all newer representation of documents found in change tree', function() {
      const context = {
        commonOptions: { strict: true },
        options: { id: 'lua', name: 'Lua Library' },
        state: null,
      };

      const mergedCompilation = subject(
        {
          refinedDocuments: [
            b.document({
              id: 'Klass',
              summary: 'Summary',
              filePath: 'klass.lua',
            }),

            b.documentEntity({
              id: 'KlassMethod',
              filePath: 'klass.lua',
            }),

            b.document({
              id: 'OtherKlass',
              filePath: 'other_klass.lua',
            }),
          ],
          renderOperations: {},
          treeOperations: [
            {
              type: 'CHANGE_NODE_PARENT',
              data: {
                parentId: 'Klass',
                id: 'KlassMethod',
              },
            }
          ],
        },
        {
          refinedDocuments: [
            b.document({
              id: 'Klass',
              filePath: 'klass.lua',
              summary: 'New Summary',
            }),

            b.documentEntity({
              id: 'KlassMethod',
              filePath: 'klass.lua',
            })
          ],
          renderOperations: {},
          treeOperations: [
            {
              type: 'CHANGE_NODE_PARENT',
              data: {
                parentId: 'Klass',
                id: 'KlassMethod',
              },
            }
          ]
        }
      );

      const mergedTree = Subject.composeTree(context,
        mergedCompilation.refinedDocuments,
        mergedCompilation.treeOperations
      )

      assert.equal(mergedTree.documents.length, 2,
        "It preserves documents in other files"
      );

      assert.ok(mergedTree.documents.some(x => x.summary === 'New Summary'));
      assert.notOk(mergedTree.documents.some(x => x.summary === 'Summary'));
      assert.equal(
        mergedTree.documents.filter(x => x.summary === 'New Summary')[0].entities.length,
        1,
        "It preserves the tree structure"
      )
    })

    it('should remove documents that are no longer referenced by source files')
  });
});