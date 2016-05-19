var Renderer = require('../Renderer');
var assert = require('chai').assert;
var TestUtils = require('../TestUtils');
var multiline = require('multiline-slash');

describe('Renderer', function() {
  var subject, spmSubject;

  beforeEach(function() {
    subject = Renderer({
      layoutOptions: {
        singlePageMode: false
      }
    });

    spmSubject = Renderer({
      layoutOptions: {
        singlePageMode: true
      }
    });
  });

  it('renders text into markdown', function() {
    assert.deepEqual(subject('Look at me!').trim(), '<p>Look at me!</p>');
  });

  describe('rendering headings', function() {
    it('generates an anchor that quick-jumps to the primary heading', function() {
      assert.include(subject('# Hello', { baseURL: '/' }), 'href="#hello"');
      assert.include(spmSubject('# Hello', { baseURL: '/' }), 'href="#/hello"');

      assert.include(subject('# Hello', { baseURL: '/foo' }), 'href="#hello"');
      assert.include(spmSubject('# Hello', { baseURL: '/foo' }), 'href="#/foo/hello"');
    });

    it('generates an anchor that quick-jumps to the heading', function() {
      assert.include(subject('## Hello'), 'href="#hello"');
    });

    describe('@options.baseURL', function() {
      it('accepts a baseURL to scope the heading anchors in', function() {
        assert.include(subject('## Hello', { baseURL: '/foobar' }),
          'href="#hello"',
          'it is ignored in non-single page mode'
        );

        assert.include(spmSubject('## Hello', { baseURL: '/foobar' }),
          'href="#/foobar/hello"',
          'it is respected in single page mode'
        );
      });

      it('does not cause side-effects', function() {
        assert.include(spmSubject('## Hello', { baseURL: '/foobar' }), 'href="#/foobar/hello"');
        assert.include(spmSubject('## Hello'), 'href="#hello"');
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

    context('when a link points to a megadoc internal entity', function() {
      it('removes the mega:// prefix from @href', function() {
        assert.include(subject('hello [world](mega://world)'), 'href="world"');
      });
    });

    context('when @config.launchExternalLinksInNewTabs is on', function() {
      beforeEach(function() {
        subject = Renderer({
          launchExternalLinksInNewTabs: true,
          layoutOptions: {
            singlePageMode: false
          }
        });
      });

      it('marks external links with [target="_blank"]', function() {
        assert.include(subject('hello [world](http://world)'), 'target="_blank"');
      });

      it('does not mark internal links with [target="_blank"]', function() {
        assert.notInclude(subject('hello [world](mega://world)'), 'target="_blank"');
      });
    })
  });

  describe('rendering code blocks', function() {
    it('performs syntax highlighting', function() {
      var text = subject(multiline(function() {;
        // # Hello
        //
        // ```javascript
        // var foo = 'bar';
        // ```
      }, true));

      assert.include(text.trim(),
        'token keyword'
      );
    });
  });

  describe('#withTOC', function() {
    var compiled;

    beforeEach(function() {
      subject = spmSubject;

      compiled = subject.withTOC([
        '# Hello [foo](http://foo.com)',
        '',
        '## World!'
      ].join('\n'), { baseURL: '/foo' });

      assert.equal(compiled.toc.length, 2);
    });

    it('works with a primary heading', function() {
      assert.equal(compiled.toc[0].id, '/foo/hello-foo');
      assert.equal(compiled.toc[0].level, 1);
    });

    it('works with a secondary heading', function() {
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

    it('[legacy] works', function() {
      var fixture = TestUtils.getInlineString(function() {;
        //
        // # Testing CommonJS Modules
        //
        // ## Second-level
        //
        // ### Third-level
        //
        // #### Fourth-level header
      }, true);

      var sections = subject.withTOC(fixture).toc;

      assert.equal(sections.length, 4);
      assert.deepEqual(sections[1], {
        id: 'second-level',
        scopedId: 'second-level',
        level: 2,
        html: 'Second-level',
        text: 'Second-level',
      });

      assert.deepEqual(sections[2], {
        id: 'third-level',
        scopedId: 'third-level',
        level: 3,
        html: 'Third-level',
        text: 'Third-level',
      });

      assert.deepEqual(sections[3], {
        id: 'fourth-level-header',
        scopedId: 'fourth-level-header',
        level: 4,
        html: 'Fourth-level header',
        text: 'Fourth-level header',
      });
    });

    it('[legacy] works with stroked headings', function() {
      var fixture = TestUtils.getInlineString(function() {;
        //
        // Testing CommonJS Modules
        // ========================
        //
        // Second-level
        // ------------
        //
        // ### Third-level
        //
        // #### Fourth-level header
      }, true);

      var sections = subject.withTOC(fixture).toc;

      assert.equal(sections.length, 4);

      assert.include(sections[0], {
        level: 1,
        text: 'Testing CommonJS Modules',
      });

      assert.include(sections[1], {
        level: 2,
        text: 'Second-level',
      });
    });
  });
});