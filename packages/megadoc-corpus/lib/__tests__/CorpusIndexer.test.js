require('../../');

var Corpus = require("../Corpus");
var Subject = require('../CorpusIndexer');
var b = require('../CorpusTypes').builders;
var assert = require('chai').assert;

describe('CorpusIndexer', function() {
  var corpus;

  beforeEach(function() {
    corpus = Corpus();
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

  it('indexes on @id', function() {
    assert.include(Subject(corpus.get('MD/X')), {
      'X': 0
    });
  });

  it('does not include the namespace id in any index', function() {
    assert.notInclude(Object.keys(Subject(corpus.get('MD/X'))), 'MD/X');
  });

  it('indexes on @parentNode.id/@id', function() {
    assert.include(Subject(corpus.get('MD/X/someProp')), {
      'X/someProp': 1
    });
  });

  it('indexes on a custom field', function() {
    assert.include(Subject(corpus.get('MD/X')), {
      'FOOBAR': 1
    });
  });

  it('indexes on a custom array field', function() {
    assert.include(Subject(corpus.get('MD/X')), {
      'Y': 1
    });
  });

  it("skips indexing when @indexFields is empty", function() {
    assert.deepEqual(Subject(corpus.get('MD/A')), {});
  });

  describe('@indexFields resolving', function() {
    it("prefers the node's own indexFields over its parents'", function() {
      assert.include(Subject(corpus.get('MD/B')), {
        'files/B.html': 1
      });
    });
  });

  it("complains if the index field is not a string", function() {
    assert.throws(function() {
      Subject(b.document({
        id: 'B',
        indexFields: [ 'id' ],
        properties: {
          id: 1
        }
      }));
    }, /Index field must be a string/);
  });
});