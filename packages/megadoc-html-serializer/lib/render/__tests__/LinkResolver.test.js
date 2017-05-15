var LinkResolver = require('../LinkResolver');
var Corpus = require('megadoc-corpus').Corpus;
var assert = require('assert');
const NodeURIDecorator = require('../../NodeURIDecorator');
var b = require('megadoc-corpus').Types.builders;

describe('LinkResolver', function() {
  var resolver, corpus;

  beforeEach(function() {
    corpus = Corpus();
    corpus.visit(NodeURIDecorator({
      layoutOptions: { singlePageMode: false }
    }));
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

    resolver = new LinkResolver(corpus);
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

  context('given a str that contains []', function() {
    it('should not consider it a link', function() {
      assert.equal(resolver.linkify({ text: '[String[]]()', strict: false }), 'String[]');
    });
  });

  context('given a broken link', function() {
    it('should generate markup for a broken link', function() {
      assert.equal(resolver.linkify({
        text: '[Foo]()',
        strict: true
      }), '[Foo](mega://)')

      assert.equal(resolver.linkify({
        text: '[Foo]()',
        strict: true,
        format: 'html'
      }), '<a class="mega-link--internal mega-link--broken">Foo</a>')
    });

    it('should leave things as they are if not in strict mode', function() {
      assert.equal(resolver.linkify({
        text: '[Foo]()',
        strict: false
      }), 'Foo')
    });
  });

  it('works by generating relative urls when possible', function() {
    var link;

    assert.ok(corpus.get('MD/Y'))
    link = resolver.lookup({ path: 'Z', contextNode: corpus.get('MD/Y') })
    assert.equal(link.href, 'Z');

    link = resolver.lookup({ path: 'Z', contextNode: corpus.get('MD') })
    assert.equal(link.href, 'articles/Z');

    link = resolver.lookup({ path: 'Z', contextNode: corpus.get('MD/Zoo/Contact') })
    assert.equal(link.href, '../articles/Z');

    link = resolver.lookup({ path: 'Z', contextNode: corpus.get('MD/Zoo') })
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
