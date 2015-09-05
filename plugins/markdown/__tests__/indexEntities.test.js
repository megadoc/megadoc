var LinkResolver = require('../../../../tinydoc/lib/LinkResolver');
var indexEntities = require('../indexEntities');
var assert = require('assert');

describe('markdown::indexEntities', function() {
  function createResolver(database, config) {
    var resolver = new LinkResolver(indexEntities(database, config || {}));

    resolver.use(function(id, registry) {
      var index = registry[id];

      if (index) {
        return { href: index.articleId, title: index.articleId };
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
      '[doc/guides/candy.md](tiny://doc/guides/candy.md)'
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
      '[doc/guides/candy.md](tiny://doc/guides/candy.md)'
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
        '[doc/guides/candy.md](tiny://doc/guides/candy.md)'
      );
    });
  });
});
