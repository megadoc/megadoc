const { assert, createBuildersWithUIDs } = require('megadoc-test-utils');
const mergeTrees = require('../mergeTrees');
const { NullLinter } = require('megadoc-linter');
const b = createBuildersWithUIDs(require('megadoc-corpus'));

describe('megadoc-compiler::mergeTrees', function() {
  const subject = mergeTrees;
  const compilationContext = {
    id: 'test-processor',
    compilerOptions: { strict: true, verbose: true }
  };

  const createCompilation = compilationSpec => ({
    linter: NullLinter,
    files: compilationSpec.rawDocuments.map(x => x.filePath),
    compilerOptions: compilationContext.compilerOptions,
    rawDocuments: compilationSpec.rawDocuments,
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


  it('should discard all documents found in changed files', function() {
    const mergedTree = mergeTwoTrees({
      changedFiles: [ 'a.js' ],

      previous: {
        rawDocuments: [
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
        rawDocuments: []
      },
    })

    assert.equal(mergedTree.rawDocuments.length, 0);
  });

  it('should not modify documents found in other files', function() {
    const mergedTree = mergeTwoTrees({
      changedFiles: [ 'a.js' ],

      previous: {
        rawDocuments: [
          b.document({ id: 'foo', filePath: 'a.js' }),
          b.document({ id: 'bar', filePath: 'b.js' })
        ]
      },

      next: {
        rawDocuments: [
        ]
      },
    })

    assert.equal(mergedTree.rawDocuments.length, 1)
    assert.include(mergedTree.rawDocuments[0], { id: 'bar', filePath: 'b.js' })
  });

  it('should be idempotent', function() {
    const assertOk = tree => {
      assert.equal(tree.rawDocuments.length, 2)
      assert.include(tree.rawDocuments[0], { id: 'foo', filePath: 'a.js' })
      assert.include(tree.rawDocuments[1], { id: 'bar', filePath: 'b.js' })
    }

    const mergedTree = mergeTwoTrees({
      changedFiles: [ 'a.js', 'b.js' ],

      previous: {
        rawDocuments: [
          b.document({ id: 'foo', filePath: 'a.js' }),
          b.document({ id: 'bar', filePath: 'b.js' })
        ]
      },

      next: {
        rawDocuments: [
          b.document({ id: 'foo', filePath: 'a.js' }),
          b.document({ id: 'bar', filePath: 'b.js' })
        ]
      },
    })

    assertOk(mergedTree);

    const nextMergedTree = mergeTwoTrees({
      changedFiles: mergedTree.rawDocuments.map(x => x.filePath),
      previous: mergedTree,
      next: mergedTree,
    })

    assertOk(nextMergedTree);
  })

  it('should remove documents that are no longer referenced by source files')
});