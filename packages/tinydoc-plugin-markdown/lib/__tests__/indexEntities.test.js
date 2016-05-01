var LinkResolver = require('tinydoc/lib/HTMLSerializer__LinkResolver');
var indexEntities = require('../indexEntities');
var assert = require('assert');
var Corpus = require('tinydoc-corpus').Corpus;

describe('markdown::indexEntities', function() {
  function createResolver(database, config) {
    var indices = indexEntities(database, '', config || {}).indices;
    var resolver = new LinkResolver(indices, Corpus());

    resolver.use(function(id, registry) {
      var index = registry[id];

      if (index) {
        return { href: '/' + index.articleId, title: index.articleId };
      }
    });

    return resolver;
  }

  it('indexes & resolves ${FILEPATH}', function() {
    var resolver = createResolver([
      {
        filePath: 'doc/guides/00-candy.md',
        id: 'doc/guides/candy.md'
      }
    ]);

    assert.equal(
      resolver.linkify('[doc/guides/00-candy.md]()'),
      '[doc/guides/candy.md](tiny://#/doc/guides/candy.md)'
    );
  });

  it('indexes & resolves ${ID}', function() {
    var resolver = createResolver([
      {
        filePath: 'doc/guides/00-candy.md',
        id: 'doc/guides/candy.md'
      }
    ]);

    assert.equal(
      resolver.linkify('[doc/guides/candy.md]()'),
      '[doc/guides/candy.md](tiny://#/doc/guides/candy.md)'
    );
  });

  context('when config.allowLeadingSlashInLinks is on', function() {
    it('indexes & resolves ${FILEPATH} and /${FILEPATH}', function() {
      var resolver = createResolver([
        {
          filePath: 'doc/guides/candy.md',
          id: 'doc/guides/candy.md'
        }
      ], { allowLeadingSlashInLinks: true });

      assert.equal(
        resolver.linkify('[/doc/guides/candy.md]()'),
        '[doc/guides/candy.md](tiny://#/doc/guides/candy.md)'
      );
    });
  });
});
