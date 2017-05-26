const { assert } = require('chai');
const composeTree = require('../stage03__composeTree');
const mergeTrees = require('../mergeTrees');
const { builders: b } = require('megadoc-corpus')

describe('megadoc-compiler::mergeTrees', function() {
  const subject = mergeTrees;
  const compilationContext = {
    id: 'test-processor',
    compilerOptions: { strict: true, verbose: true }
  };

  const createCompilation = compilationSpec => ({
    files: compilationSpec.documents.map(x => x.filePath),
    compilerOptions: compilationContext.compilerOptions,
    documents: compilationSpec.documents,
    renderOperations: compilationSpec.renderOperations || {},
    treeOperations: compilationSpec.treeOperations || [],
  })

  const mergeTwoTrees = spec => {
    const previousCompilation = createCompilation(spec.previous);
    const nextCompilation = Object.assign(createCompilation(spec.next), {
      files: spec.changedFiles
    });

    return subject(previousCompilation, nextCompilation);
  }

  const run = spec => {
    const mergedCompilation = mergeTwoTrees(spec)
    const mergedTree = composeTree({
      id: compilationContext.id,
      compilerOptions: compilationContext.compilerOptions,
      documents: mergedCompilation.documents,
      treeOperations: mergedCompilation.treeOperations
    })

    return mergedTree;
  }

  it('should discard all documents found in changed files', function() {
    const mergedTree = run({
      changedFiles: [ 'a.js' ],

      previous: {
        documents: [
          b.document({
            id: 'foo',
            filePath: 'a.js',
          }),
          b.document({
            id: 'bar',
            filePath: 'a.js',
          })
        ]
      },

      next: {
        documents: []
      },
    })

    assert.equal(mergedTree.documents.length, 0);
  });

  it('should not modify documents found in other files', function() {
    const mergedTree = run({
      changedFiles: [ 'a.js' ],

      previous: {
        documents: [
          b.document({ id: 'foo', filePath: 'a.js' }),
          b.document({ id: 'bar', filePath: 'b.js' })
        ]
      },

      next: {
        documents: [
        ]
      },
    })

    assert.equal(mergedTree.documents.length, 1)
    assert.include(mergedTree.documents[0], { id: 'bar', filePath: 'b.js' })
  });

  it('should be idempotent', function() {
    const assertOk = tree => {
      assert.equal(tree.documents.length, 2)
      assert.include(tree.documents[0], { id: 'foo', filePath: 'a.js' })
      assert.include(tree.documents[1], { id: 'bar', filePath: 'b.js' })
    }

    const mergedTree = mergeTwoTrees({
      changedFiles: [ 'a.js', 'b.js' ],

      previous: {
        documents: [
          b.document({ id: 'foo', filePath: 'a.js' }),
          b.document({ id: 'bar', filePath: 'b.js' })
        ]
      },

      next: {
        documents: [
          b.document({ id: 'foo', filePath: 'a.js' }),
          b.document({ id: 'bar', filePath: 'b.js' })
        ]
      },
    })

    assertOk(mergedTree);

    const nextMergedTree = mergeTwoTrees({
      changedFiles: mergedTree.documents.map(x => x.filePath),
      previous: mergedTree,
      next: mergedTree,
    })

    assertOk(nextMergedTree);
  })

  it('should use all newer representation of documents found in change tree', function() {
    const mergedTree = run({
      changedFiles: [ 'klass.lua' ],
      previous: {
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

      next: {
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
    });

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