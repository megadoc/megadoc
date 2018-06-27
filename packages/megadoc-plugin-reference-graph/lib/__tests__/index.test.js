const { assert, createIntegrationSuite } = require('megadoc-test-utils');

describe('megadoc-decorator-reference-graph', function() {
  const suite = createIntegrationSuite(this);

  beforeEach(function() {
    suite.createFile('document-a.md', 'Hello world! See [[./document-b.md]] and [[./document-c.md]]')
    suite.createFile('document-b.md', 'Hello world!')
    suite.createFile('document-c.md', 'Hello world!')
  })

  it('works', function(done) {
    suite.compile({
      assetRoot: suite.root,
      sources: [
        {
          include: [
            'document-a.md',
            'document-b.md',
          ],
          processor: {
            name: 'megadoc-plugin-markdown',
          },
          decorators: [
            [ require.resolve('../index.js'), {} ],
          ]
        },
        {
          id: 'weeh',
          include: [ 'document-c.md' ],
          processor: {
            name: 'megadoc-plugin-markdown',
          },
        },
      ]
    }, {}, function(err, state) {
      if (err) {
        done(err)
      }
      else {
        const [ documentA ] = state.compilations[0].documents.filter(x => x.id === 'document-a')
        const [ documentB ] = state.compilations[0].documents.filter(x => x.id === 'document-b')
        const [ documentC ] = state.compilations[1].documents.filter(x => x.id === 'document-c')

        assert.deepEqual(documentA.meta.references, [])

        assert.include(documentB.meta.references, documentA.uid)

        assert.equal(documentC.meta.references, undefined)

        done();
      }
    })
  });
})