var LinkResolver = require('../HTMLSerializer__LinkResolver');
var Corpus = require('tinydoc-corpus').Corpus;
var assert = require('assert');
var b = require('tinydoc-corpus').Types.builders;

describe('HTMLSerializer::LinkResolver', function() {
  var resolver, corpus;

  beforeEach(function() {
    corpus = Corpus();
    corpus.visit(require('../HTMLSerializer__CorpusVisitor')({}));

    resolver = new LinkResolver(null, corpus);
    resolver.use(function dummyResolver(id, registry) {
      return registry && registry[id];
    });
  });

  it('should not blow up with a docstring containing no links', function() {
    assert.doesNotThrow(function() {
      resolver.linkify('');
      resolver.linkify();
    });
  });

  describe('resolving', function() {
    it('uses an inferred title', function() {
      resolver.registry = {
        '/doc/candy.md': { title: 'Candy Land', href: '/candy.md' }
      };

      assert.equal(
        resolver.linkify('Look! [/doc/candy.md]().'),
        'Look! [Candy Land](tiny:///candy.md).'
      );
    });

    it('uses a custom title', function() {
      resolver.registry = {
        '/doc/candy.md': { href: '/candy.md', title: 'Candy Land' }
      };

      assert.equal(
        resolver.linkify('Go [/doc/candy.md here]() for candy.'),
        'Go [here](tiny:///candy.md) for candy.'
      );
    });

    it('uses the path if no title was found', function() {
      resolver.registry = {
        '/doc/candy.md': { href: '/candy.md' }
      };

      assert.equal(
        resolver.linkify('Go [/doc/candy.md]() for candy.'),
        'Go [/doc/candy.md](tiny:///candy.md) for candy.'
      );
    });
  });

  context('given an escaped link "\\[something]()"', function() {
    it('should leave it alone', function() {
      assert.equal(resolver.linkify('\\[something]()'), '[something]()');
    });
  });

  context('given a str that contains []', function() {
    it('should not consider it a link', function() {
      assert.equal(resolver.linkify('[String[]]()', null, { strict: false }), 'String[]');
    });
  });

  describe('resolving using the corpus', function() {
    beforeEach(function() {
      corpus.add(
        b.namespace({
          meta: {
            href: '/articles',
          },
          id: 'MD',
          corpusContext: 'Articles',
          documents: [
            b.document({
              id: 'X',
              title: 'Gone to the Zoo',
              filePath: '/doc/articles/X.md',
            }),

            b.document({
              id: 'Y',
              title: 'Came back from the Zoo',
              filePath: '/doc/articles/Y.md',
            }),

            b.document({
              id: 'Z',
              title: 'Where is the Zoo',
              filePath: '/doc/articles/Z.md',
            }),

            b.document({
              id: 'Zoo',
              meta: {
                href: '/the-zoo',
              },
              title: 'The Zoo',
              filePath: '/doc/zoo/README.md',
              documents: [
                b.document({
                  id: 'Contact',
                  href: '/the-zoo/contact',
                  title: 'Contact Us - The Zoo',
                  filePath: '/doc/zoo/contact.md'
                })
              ]
            }),
          ]
        })
      );
    });

    it('works by generating relative urls when possible', function() {
      var link;

      assert.ok(corpus.get('MD/Y'))
      link = resolver.lookup('Z', { contextNode: corpus.get('MD/Y') })
      assert.equal(link.href, 'Z');

      link = resolver.lookup('Z', { contextNode: corpus.get('MD') })
      assert.equal(link.href, 'articles/Z');

      link = resolver.lookup('Z', { contextNode: corpus.get('MD/Zoo/Contact') })
      assert.equal(link.href, '../articles/Z');

      link = resolver.lookup('Z', { contextNode: corpus.get('MD/Zoo') })
      assert.equal(link.href, 'articles/Z');
    });
  });
});
