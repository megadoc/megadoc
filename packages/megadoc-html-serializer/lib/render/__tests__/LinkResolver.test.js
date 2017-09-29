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

    corpus.traverse(NodeURIDecorator({
      singlePageMode: false
    }));

    resolver = new LinkResolver(corpus, { linter: NullLinter });
  });

  it('should not blow up with a docstring containing no links', function() {
    assert.doesNotThrow(function() {
      resolver.linkify({ text: '' });
      resolver.linkify({ text: null });
    });
  });

  describe('resolving', function() {
    it('uses an inferred title', function() {
      assert.equal(
        resolver.linkify({ text: 'Look! [Zoo]().' }),
        'Look! [The Zoo](mega:///the-zoo).'
      );
    });

    it('uses a custom title', function() {
      assert.equal(
        resolver.linkify({ text: 'Go [Zoo here]() for candy.' }),
        'Go [here](mega:///the-zoo) for candy.'
      );
    });
  });

  context('given an escaped link "\\[something]()"', function() {
    it('should leave it alone', function() {
      assert.equal(resolver.linkify({ text: '\\[something]()' }), '[something]()');
    });
  });

  context('given a link string that contains []', function() {
    it('still considers it a link', function() {
      stubConsoleWarn(/Unable to resolve link to "String\[\]"/);
      assert.equal(resolver.linkify({ text: '[String[]]()' }), '[String[]](mega://)');
    });
  });

  context('given a broken link', function() {
    it('should generate markup for a broken link', function() {
      stubConsoleWarn(/Unable to resolve link to "Foo"/);

      assert.equal(resolver.linkify({
        text: '[Foo]()',
      }), '[Foo](mega://)')

      assert.equal(resolver.linkify({
        text: '[Foo]()',
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
          injectors: [ MonkeyInjector ]
        }),
        'Is it [tee hee!](mega:///the-zoo) time?'
      );
    });
  });
});
