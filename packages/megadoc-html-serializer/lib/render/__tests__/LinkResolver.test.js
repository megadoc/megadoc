const LinkResolver = require('../LinkResolver');
const Corpus = require('megadoc-corpus').Corpus;
const NodeURIDecorator = require('../../NodeURIDecorator');
const { assert, createBuildersWithUIDs, stubConsoleWarn } = require('megadoc-test-utils')
const { NullLinter } = require('megadoc-linter')
const b = createBuildersWithUIDs(require('megadoc-corpus'));

describe('LinkResolver', function() {
  var resolver, corpus;

  beforeEach(function() {
    corpus = Corpus({ alias: {} }, { linter: NullLinter });
    corpus.add(
      b.namespace({
        meta: {
          href: '/articles',
        },
        id: 'MD',
        name: 'markdown',
        title: 'Articles',
        documents: [
          b.document({
            id: 'X',
            title: 'Gone to the Zoo',
            filePath: '/doc/articles/X.md',
            entities: [
              b.documentEntity({
                id: '.Y',
                filePath: '/doc/articles/X.md',
                entities: [
                  b.documentEntity({
                    id: '.Z',
                    filePath: '/doc/articles/X.md',
                  })
                ]
              })
            ]
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
                meta: {
                  href: '/the-zoo/contact',
                },
                title: 'Contact Us - The Zoo',
                filePath: '/doc/zoo/contact.md'
              })
            ]
          }),
        ]
      })
    );

    corpus.traverse(NodeURIDecorator({}));

    resolver = new LinkResolver(corpus, {
      linter: NullLinter,
      edgeGraph: {}
    });
  });

  it('should not blow up with a docstring containing no links', function() {
    assert.doesNotThrow(function() {
      resolver.linkify({ text: '', contextNode: corpus.at('MD') });
      resolver.linkify({ text: null, contextNode: corpus.at('MD') });
    });
  });

  describe('resolving', function() {
    it('uses an inferred title', function() {
      assert.include(
        resolver.linkify({
          text: 'Look! [Zoo]().',
          contextNode: corpus.at('MD')
        }),
        'Look! [The Zoo]'
      );
    });

    it('uses a custom title', function() {
      assert.include(
        resolver.linkify({
          text: 'Go [Zoo here]() for candy.',
          contextNode: corpus.at('MD')
        }),
        'Go [here]'
      );
    });
  });

  context('given an escaped link "\\[something]()"', function() {
    it('should leave it alone', function() {
      assert.equal(resolver.linkify({
        text: '\\[something]()',
        contextNode: corpus.at('MD')
      }), '[something]()');
    });
  });

  context('given a link string that contains []', function() {
    it('still considers it a link', function() {
      stubConsoleWarn(/Unable to resolve link to "String\[\]"/);

      assert.equal(resolver.linkify({
        text: '[String[]]()',
        contextNode: corpus.at('MD')
      }), '[String[]](mega://)');
    });
  });

  context('given a broken link', function() {
    it('should generate markup for a broken link', function() {
      stubConsoleWarn(/Unable to resolve link to "Foo"/);

      assert.equal(resolver.linkify({
        text: '[Foo]()',
        contextNode: corpus.at('MD'),
      }), '[Foo](mega://)')

      assert.equal(resolver.linkify({
        text: '[Foo]()',
        contextNode: corpus.at('MD'),
        format: 'html'
      }), '<a class="mega-link--internal mega-link--broken">Foo</a>')
    });
  });

  it('works by generating relative urls when possible', function() {
    var link;

    assert.ok(corpus.at('MD/Y'))
    link = resolver.lookup({ path: 'Z', contextNode: corpus.at('MD/Y') })
    assert.equal(link.href, 'Z');

    link = resolver.lookup({ path: 'Z', contextNode: corpus.at('MD') })
    assert.equal(link.href, 'articles/Z');

    link = resolver.lookup({ path: 'Z', contextNode: corpus.at('MD/Zoo/Contact') })
    assert.equal(link.href, '../articles/Z');

    link = resolver.lookup({ path: 'Z', contextNode: corpus.at('MD/Zoo') })
    assert.equal(link.href, 'articles/Z');
  });

  describe('generating HREF', function() {
    context('for an entity nested under another entity...', function() {
      it('uses the target entity anchor prefixed by the enclosing document path', function() {
        const link = resolver.lookup({ path: 'MD/X/.Y.Z', contextNode: corpus.at('MD/Y') })

        assert.ok(link)
        assert.equal(link.href, 'X#.Y.Z')
      })
    })
  })
  describe('custom injectors', function() {
    function MonkeyInjector(text, render) {
      return text.replace(/tee/g, function() {
        return render({ source: 'tee', path: 'Zoo', text: 'tee hee!' });
      });
    }

    it('should accept the injector', function() {
      assert.equal(
        resolver.linkify({
          text: 'Is it tee time?',
          contextNode: corpus.at('MD'),
          injectors: [ MonkeyInjector ]
        }),
        'Is it [tee hee!](mega://the-zoo) time?'
      );
    });
  });
});
