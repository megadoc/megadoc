var Subject = require("../render");
var multiline = require('multiline-slash');
var assert = require('chai').assert;
var IntegrationSuite = require('megadoc/lib/TestUtils').IntegrationSuite;
var b = require('megadoc-corpus').builders;
var cheerio = require('cheerio');

describe("megadoc-plugin-dot::render", function() {
  var suite = IntegrationSuite(this);
  var subject;

  beforeEach(function() {
    subject = Subject(suite.compiler, {
      allowLinks: false
    });
  });

  it('works', function() {
    var out = subject(multiline(function() {;
      // graph {
      //   Root -- A -- B;
      //   B -- C;
      //   B -- D;
      // }
    }));

    assert.include(out, '<svg');
  });

  describe('when links are allowed...', function() {
    beforeEach(function() {
      subject = Subject(suite.compiler, {
        allowLinks: true
      });

      suite.compiler.corpus.add(b.namespace({
        id: 'Root',
        name: 'test-plugin',
        title: 'Root',
        meta: {
          href: '/Root.html'
        },
        documents: [
          b.document({
            id: 'Cache',
            title: 'Cache',
            meta: {
              href: '/Root--Cache.html'
            }
          })
        ]
      }));
    });

    it('resolves links', function() {
      var svg;
      var anchors;

      svg = subject(multiline(function() {;
        // [mega://Root]
      }));

      anchors = getAnchors(svg);

      assert.equal(anchors.length, 1);
      assert.equal(anchors[0].href, '/Root.html');
      assert.equal(anchors[0].textContent, 'Root');
    });

    it('does not confuse links', function() {
      var svg = subject(multiline(function() {;
        // [mega://Root]
        // [mega://Root/Cache]
        // [mega://Root/Buster]
      }));

      var anchors = getAnchors(svg);

      assert.equal(anchors.length, 3);
      assert.equal(anchors[0].href, '/Root.html');
      assert.equal(anchors[0].textContent, 'Root');

      assert.equal(anchors[1].href, '/Root--Cache.html');
      assert.equal(anchors[1].textContent, 'Cache');

      assert.include(anchors[2].text, 'Root/Buster');
      assert.include(anchors[2].className, 'mega-link--broken');
    });

    it('accepts custom text', function() {
      var svg = subject(multiline(function() {;
        // [mega://Root as "Foo"]
      }));

      var anchors = getAnchors(svg);

      assert.equal(anchors.length, 1);
      assert.equal(anchors[0].href, '/Root.html');
      assert.equal(anchors[0].textContent, 'Foo');
    });

    it('accepts custom text with space inside', function() {
      var svg = subject(multiline(function() {;
        // [mega://Root as "Gone to the Zoo"]
      }));

      var anchors = getAnchors(svg);

      assert.equal(anchors.length, 1);
      assert.equal(anchors[0].href, '/Root.html');
      assert.equal(anchors[0].textContent, 'Gone to the Zoo');
    });

    it('works with frames', function() {
      var svg = subject(multiline(function() {;
        // [Foo | mega://Root as "Gone to the Zoo"]
      }));

      var anchors = getAnchors(svg);

      assert.equal(anchors.length, 1);
      assert.equal(anchors[0].href, '/Root.html');
      assert.equal(anchors[0].textContent, 'Gone to the Zoo');

      assert.include(svg, 'Foo');
    });
  });
});

function getAnchors(svg) {
  var dom = cheerio.load(svg);

  return dom('a');
}