var Renderer = require('../Renderer');
var { assert, multiline } = require('megadoc-test-utils');

describe('Renderer', function() {
  var subject;

  beforeEach(function() {
    subject = Renderer({
    });
  });

  it('renders text into markdown', function() {
    assert.deepEqual(subject({ text: 'Look at me!' }).trim(), '<p>Look at me!</p>');
  });

  describe('rendering headings', function() {
    it('generates an anchor that quick-jumps to the primary heading', function() {
      assert.include(subject({ text: '# Hello' }), 'href="#hello"');
      assert.include(subject({ text: '# Hello' }), 'href="#hello"');
    });

    it('generates an anchor that quick-jumps to the heading', function() {
      assert.include(subject({ text: '## Hello' }), 'href="#hello"');
    });
  });

  describe('@options.trimHTML', function() {
    it('removes the surrounding <p></p>', function() {
      assert.deepEqual(subject({ text: 'hello', trimHTML: true }), 'hello');
    });

    it('leaves other markup intact', function() {
      assert.deepEqual(subject({ text: '_hello_', trimHTML: true }), '<em>hello</em>')
    });
  });

  describe('rendering links', function() {
    it('does not cause double-escaping of text', function() {
      var text = subject({ text: 'hello [<world />](http://foobar)' });

      assert.deepEqual(text.trim(),
        '<p>hello <a href="http://foobar">&lt;world /&gt;</a></p>'
      );
    });

    context('when a link points to a megadoc internal entity', function() {
      it('removes the mega:// prefix from @href', function() {
        assert.include(subject({ text: 'hello [world](mega://world)' }), 'href="world"');
      });

      it('marks it as an internal link', function() {
        assert.include(subject({ text: 'hello [world](mega://world)' }), 'class="mega-link--internal"');
      });

      it('marks it as a broken internal link if it has no href', function() {
        assert.include(subject({ text: 'hello [world](mega://)' }), 'class="mega-link--internal mega-link--broken"');
      });
    });

    context('when @config.launchExternalLinksInNewTabs is on', function() {
      beforeEach(function() {
        subject = Renderer({
          launchExternalLinksInNewTabs: true,
          shortURLs: true,
        });
      });

      it('marks external links with [target="_blank"]', function() {
        assert.include(subject({ text: 'hello [world](http://world)' }), 'target="_blank"');
      });

      it('does not mark internal links with [target="_blank"]', function() {
        assert.notInclude(subject({ text: 'hello [world](mega://world)' }), 'target="_blank"');
      });
    })
  });

  describe('rendering code blocks', function() {
    it('performs syntax highlighting', function() {
      var text = subject({
        text: multiline(function() {;
          // # Hello
          //
          // ```javascript
          // var foo = 'bar';
          // ```
        }, true)
      });

      assert.include(text.trim(),
        'token keyword'
      );
    });
  });
});