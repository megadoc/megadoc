var assert = require('chai').assert;
var TestUtils = require('../Parser/TestUtils');
var reduceDocuments = require('../CorpusReducer');
var Corpus = require('megadoc-corpus').Corpus;

describe('cjs::resolveLink', function() {
  var corpus;

  before(function() {
    var documents = TestUtils.parseInline(function() {;
      // /**
      //  * @namespace Core
      //  * @module
      //  */
      // function Cache() {}
      //
      // /**
      //  * Add an item to the cache.
      //  */
      // Cache.prototype.add = function() {
      // };
    });

    corpus = Corpus();
    corpus.add(reduceDocuments({
      documents: documents,
      baseURL: '/',
      namespaceId: 'test'
    }));
  });

  function subject(text) {
    return corpus.resolve({ text: text });
  }

  it('resolves ${NS}.${MODULE}', function() {
    assert.ok(subject('Core.Cache'));
  });

  it('resolves ${MODULE}', function() {
    assert.ok(subject('Core.Cache'));
  });

  it('resolves ${NS}.${MODULE}${SYM}${ENTITY}', function() {
    assert.ok(subject('Core.Cache#add'));
  });

  it('resolves ${MODULE}${SYM}${ENTITY}', function() {
    assert.ok(subject('Cache#add'));
  });

  context('Given a currentModuleId', function() {
    it('resolves ${SYM}${ENTITY}', function() {
      assert.notOk(subject('#add'));
      assert.ok(corpus.resolve({
        text: '#add',
        contextNode: subject('Core.Cache')
      }));
    });

    // this is no longer applicable...
    it.skip('strips ${MODULE} from title if it is the same module', function() {
      // var link = resolveLink(database, 'Cache#add', registry, 'Core.Cache');
      // assert.equal(link.title, '#add');
    });

    // this is no longer applicable...
    it.skip('does not strip ${MODULE} from title if it is a different module', function() {
      // var link = resolveLink(database, 'Cache#add', registry, 'Something');
      // assert.equal(link.title, 'Cache#add');
    });
  });
});