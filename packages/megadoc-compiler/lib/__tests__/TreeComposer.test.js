require('../Compiler')
const { assert } = require('chai');
const composeTree = require('../stage03__composeTree');
const mergeTrees = require('../mergeTrees');
const { builders: b } = require('megadoc-corpus')

describe('megadoc-compiler::TreeComposer', function() {
  describe('.composeTree', function() {
    const subject = composeTree;

    it('should distribute each file to it', function() {
      const tree = subject({
        id: 'foo',
        compilerOptions: {},
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
  });

  describe('.mergeTrees', function() {
    const subject = mergeTrees;

    it('should use all newer representation of documents found in change tree', function() {
      const context = {
        id: 'lua',
        compilerOptions: { strict: true },
        options: { name: 'Lua Library' },
      };

      const mergedCompilation = subject(
        {
          compilerOptions: {
            verbose: false,
          },
          documents: [
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
          compilerOptions: {
            verbose: false,
          },
          documents: [
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

      const mergedTree = composeTree({
        id: context.id,
        compilerOptions: context.compilerOptions,
        documents: mergedCompilation.documents,
        treeOperations: mergedCompilation.treeOperations
      })

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