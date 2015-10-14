var Renderer = require('../Renderer');
var LinkResolver = require('../LinkResolver');
var assert = require('chai').assert;

describe('Renderer', function() {
  var subject;

  describe('#renderMarkdown', function() {
    it('renders text into markdown', function() {
      var linkResolver = new LinkResolver({});

      subject = new Renderer(linkResolver);

      assert.equal(
        subject.renderMarkdown('Look at me!'),
        '<p>Look at me!</p>\n'
      );
    });

    it('renders headings with an anchor', function() {
      var linkResolver = new LinkResolver({});

      subject = new Renderer(linkResolver);

      assert.include(
        subject.renderMarkdown('## Hello'),
        'href="#--hello"'
      );
    });

    it('resolves internal links found in the text', function() {
      var linkResolver = new LinkResolver({});

      linkResolver.registry = {
        'foo': {
          href: '/path/to/foo',
          title: 'Foo'
        }
      };

      linkResolver.use(function dummyResolver(id, registry) {
        return registry[id];
      });

      subject = new Renderer(linkResolver);

      assert.include(
        subject.renderMarkdown(
          linkResolver.linkify('Look at [foo]() for more information.')
        ),
        'at <a href="/path/to/foo" data-internal="true">Foo</a> for more'
      );
    });
  });
});