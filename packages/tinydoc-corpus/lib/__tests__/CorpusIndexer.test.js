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
        indexFields: [ 'aliases', 'moduleId' ],
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
        ]
      })
    );
  });

  it('indexes on @id', function() {
    assert.include(Subject(corpus.get('MD/X')), {
      'X': 1
    });
  });

  it('does not include the namespace id in any index', function() {
    assert.notInclude(Object.keys(Subject(corpus.get('MD/X'))), 'MD/X');
  });

  it('indexes on @parentNode.id/@id', function() {
    assert.include(Subject(corpus.get('MD/X/someProp')), {
      'X/someProp': 2
    });
  });

  it('indexes on a custom indexField', function() {
    assert.include(Subject(corpus.get('MD/X')), {
      'FOOBAR': 1
    });
  });

  it('indexes on a custom array indexField', function() {
    assert.include(Subject(corpus.get('MD/X')), {
      'Y': 1
    });
  });
});