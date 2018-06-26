const subject = require('../markdownToText')
const analyzeDocument = require('../analyzeDocument')
const { assert, multiline } = require('megadoc-test-utils')

describe('megadoc-markdown-utils::markdownToText', function() {
  it('removes links but keeps their text', function() {
    assert.equal(subject('hello [world](world-bookmark)!'), '\nhello world!\n')
    assert.equal(subject('hello [world][world-bookmark]!\n\n[world-bookmark]: http://hello-world'), '\nhello world!\n')
  })
})

describe('megadoc-markdown-utils::analyzeDocument', function() {
  it('removes HTML tags but keeps their content', function() {
    const stats = analyzeDocument('## <a name="configuring-tools"></a>Configuring the tools you will need')

    assert.include(stats.headings[0], {
      id: 'configuring-the-tools-you-will-need',
      text: 'Configuring the tools you will need'
    })
  })

  // until we figure it out with marked...
  it.skip('escapes HTML in headings', function() {
    const stats = analyzeDocument('## Call me at <unknown>')

    assert.equal(stats.headings[0].id, 'call-me-at-unknown')
    assert.equal(stats.headings[0].text, 'Call me at <unknown>')
  })

  describe('TOC', function() {
    var compiled;

    beforeEach(function() {
      compiled = analyzeDocument(`
# Hello [foo](http://foo.com)

## World!

## There

### World!
      `);

      assert.equal(compiled.headings.length, 4);
    });

    it('works with a primary heading', function() {
      assert.equal(compiled.headings[0].id, 'hello-foo');
      assert.equal(compiled.headings[0].level, 1);
    });

    it('works with a secondary heading', function() {
      assert.equal(compiled.headings[1].id, 'world');
      assert.equal(compiled.headings[1].level, 2);
      assert.equal(compiled.headings[1].text, 'World!');
    });

    it('renders the text into plain-text', function() {
      assert.equal(compiled.headings[0].text, 'Hello foo');
    });

    it('[legacy] works', function() {
      var fixture = multiline(function() {;
        //
        // # Testing CommonJS Modules
        //
        // ## Second-level
        //
        // ### Third-level
        //
        // #### Fourth-level header
      }, true);

      const { headings } = analyzeDocument(fixture);

      assert.equal(headings.length, 4);
      assert.include(headings[1], {
        id: 'second-level',
        scopedId: 'second-level',
        level: 2,
        text: 'Second-level',
      });

      assert.include(headings[2], {
        id: 'third-level',
        scopedId: 'third-level',
        level: 3,
        text: 'Third-level',
      });

      assert.include(headings[3], {
        id: 'fourth-level-header',
        scopedId: 'fourth-level-header',
        level: 4,
        text: 'Fourth-level header',
      });
    });

    it('[legacy] works with stroked headings', function() {
      var fixture = multiline(function() {;
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

      const { headings } = analyzeDocument(fixture);

      assert.equal(headings.length, 4);

      assert.include(headings[0], {
        level: 1,
        text: 'Testing CommonJS Modules',
      });

      assert.include(headings[1], {
        level: 2,
        text: 'Second-level',
      });
    });
  })
})