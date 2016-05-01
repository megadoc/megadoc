var LinkResolver = require('../HTMLSerializer__LinkResolver');
var Corpus = require('tinydoc-corpus').Corpus;
var assert = require('assert');

describe('LinkResolver', function() {
  var resolver;

  beforeEach(function() {
    resolver = new LinkResolver(null, Corpus());
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
        'Look! [Candy Land](tiny://#/candy.md).'
      );
    });

    it('uses a custom title', function() {
      resolver.registry = {
        '/doc/candy.md': { href: '/candy.md', title: 'Candy Land' }
      };

      assert.equal(
        resolver.linkify('Go [/doc/candy.md here]() for candy.'),
        'Go [here](tiny://#/candy.md) for candy.'
      );
    });

    it('uses the path if no title was found', function() {
      resolver.registry = {
        '/doc/candy.md': { href: '/candy.md' }
      };

      assert.equal(
        resolver.linkify('Go [/doc/candy.md]() for candy.'),
        'Go [/doc/candy.md](tiny://#/candy.md) for candy.'
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
});
