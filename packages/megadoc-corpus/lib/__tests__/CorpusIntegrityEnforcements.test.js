require('../../');

var assert = require('megadoc-test-utils').assert;
var Corpus = require("../Corpus");
var b = require('../CorpusTypes').builders;

describe.skip('Corpus::IntegrityEnforcements', function() {
  var corpus;

  beforeEach(function() {
    corpus = Corpus();
    corpus.add(
      b.namespace({
        id: 'test',
        name: 'test-plugin',
        documents: [
          b.document({
            id: 'X',
            filePath: 'doc/articles/X.md',
          }),
        ]
      })
    );
  });

  it('ensures file paths have a leading slash', function() {
    assert.include(corpus.get('test/X'), {
      'filePath': '/doc/articles/X.md'
    });
  });
});