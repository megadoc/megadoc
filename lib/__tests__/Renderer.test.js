var Renderer = require('../Renderer');
var assert = require('chai').assert;

describe('Renderer', function() {
  var subject;

  beforeEach(function() {
    subject = Renderer({});
  });

  it('renders text into markdown', function() {
    assert.deepEqual(subject('Look at me!').trim(), '<p>Look at me!</p>');
  });

  describe('rendering headings', function() {
    it('generates an anchor that quick-jumps to the primary heading', function() {
      assert.include(subject('# Hello'), 'href="#"');
      assert.include(subject('# Hello', { baseURL: '/foo' }), 'href="#/foo"');
    });

    it('generates an anchor that quick-jumps to the heading', function() {
      assert.include(subject('## Hello'), 'href="#/hello"');
    });

    describe('@options.baseURL', function() {
      it('accepts a baseURL to scope the heading anchors in', function() {
        assert.include(
          subject('## Hello', { baseURL: '/foobar' }),
          'href="#/foobar/hello"'
        );
      });

      it('does not cause side-effects', function() {
        assert.include(subject('## Hello', { baseURL: '/foobar' }), 'href="#/foobar/hello"');
        assert.include(subject('## Hello'), 'href="#/hello"');
      });
    });
  });

  describe('@options.trimHTML', function() {
    it('removes the surrounding <p></p>', function() {
      assert.deepEqual(subject('hello', { trimHTML: true }), 'hello');
    });

    it('leaves other markup intact', function() {
      assert.deepEqual(subject('_hello_', { trimHTML: true }), '<em>hello</em>')
    });
  });

  describe('rendering links', function() {
    it('does not cause double-escaping of text', function() {
      var text = subject('hello [<world />](http://foobar)');

      assert.deepEqual(text.trim(),
        '<p>hello <a href="http://foobar">&lt;world /&gt;</a></p>'
      );
    });

    context('when a link points to a tinydoc internal entity', function() {
      it('marks it with [data-internal="true"]', function() {
        assert.include(
          subject('hello [world](tiny://world)'),
          'data-internal="true"'
        );
      });

      it('removes the tiny:// prefix from @href', function() {
        assert.include(subject('hello [world](tiny://world)'), 'href="world"');
      });
    });

    context('when a link points to an external entity', function() {
      it('does not mark it with [data-internal="true"]', function() {
        assert.notInclude(
          subject('hello [world](http://world)'),
          'data-internal="true"'
        );
      });
    });

    context('when @config.launchExternalLinksInNewTabs is on', function() {
      beforeEach(function() {
        subject = Renderer({ launchExternalLinksInNewTabs: true });
      });

      it('marks external links with [target="_blank"]', function() {
        assert.include(subject('hello [world](http://world)'), 'target="_blank"');
      });

      it('does not mark internal links with [target="_blank"]', function() {
        assert.notInclude(subject('hello [world](tiny://world)'), 'target="_blank"');
      });
    })
  });

  describe('#withTOC', function() {
    var compiled;

    beforeEach(function() {
      compiled = subject.withTOC([
        '# Hello [foo](http://foo.com)',
        '',
        '## World!'
      ].join('\n'), { baseURL: '/foo' });

      assert.equal(compiled.toc.length, 2);
    });

    it('works with a primary heading', function() {
      assert.equal(compiled.toc[0].id, '/foo');
      assert.equal(compiled.toc[0].level, 1);
    });

    it('works with a seconary heading', function() {
      assert.equal(compiled.toc[1].id, '/foo/world');
      assert.equal(compiled.toc[1].level, 2);
      assert.equal(compiled.toc[1].text, 'World!');
    });

    it('renders the text into plain-text', function() {
      assert.equal(compiled.toc[0].text, 'Hello foo');
    });

    it('renders the text into HTML', function() {
      assert.equal(compiled.toc[0].html, 'Hello <a href="http://foo.com">foo</a>');
    });
  });
});