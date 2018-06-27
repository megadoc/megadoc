require('../../');

const Corpus = require("../Corpus");
const Subject = require('../CorpusIndexer');
const { assert, createBuildersWithUIDs } = require('megadoc-test-utils');
const { NullLinter } = require('megadoc-linter')
const b = createBuildersWithUIDs(require('../../'));

describe('CorpusIndexer', function() {
  let corpus;

  beforeEach(function() {
    corpus = Corpus({}, { linter: NullLinter });
    corpus.add(
      b.namespace({
        id: 'MD',
        name: 'test-plugin',
        title: 'Articles',
        indexFields: [ '$uid', 'aliases', 'moduleId' ],
        documents: [
          b.document({
            id: 'X',
            filePath: '/doc/articles/X.md',
            entities: [
              b.documentEntity({
                id: 'someProp'
              })
            ],
            properties: {
              moduleId: 'FOOBAR',
              aliases: [ 'Y' ]
            },
          }),

          b.document({
            id: 'A',
            indexFields: []
          }),

          b.document({
            id: 'B',
            indexFields: [ 'fileName' ],
            properties: {
              fileName: 'files/B.html'
            }
          }),
        ]
      })
    );
  });

  const run = x => Subject(corpus, {}, x);

  it('indexes on @id', function() {
    assert.include(run(corpus.at('MD/X')), {
      'X': 1
    });
  });

  it('does not include the namespace id in any index', function() {
    assert.notInclude(Object.keys(run(corpus.at('MD/X'))), 'MD/X');
  });

  it('indexes on @parentNode.id/@id', function() {
    assert.include(run(corpus.at('MD/X/someProp')), {
      'X/someProp': 1
    });
  });

  it('indexes on a custom field', function() {
    assert.include(run(corpus.at('MD/X')), {
      'FOOBAR': 1
    });
  });

  it('indexes on a custom array field', function() {
    assert.include(run(corpus.at('MD/X')), {
      'Y': 1
    });
  });

  it("skips indexing when @indexFields is empty", function() {
    assert.deepEqual(run(corpus.at('MD/A')), {});
  });

  describe('@indexFields resolving', function() {
    it("prefers the node's own indexFields over its parents'", function() {
      assert.include(run(corpus.at('MD/B')), {
        'files/B.html': 1
      });
    });
  });

  it("complains if the index field is not a string", function() {
    assert.throws(function() {
      run(b.document({
        id: 'B',
        indexFields: [ 'id' ],
        properties: {
          id: 1
        }
      }));
    }, /Index field must be a string/);
  });
});