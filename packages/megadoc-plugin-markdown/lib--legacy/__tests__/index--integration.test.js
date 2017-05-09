var Subject = require("../");
var assert = require('chai').assert;
var IntegrationSuite = require('megadoc-test-utils/LegacyTestUtils').IntegrationSuite;

describe("[Integration] megadoc-plugin-markdown", function() {
  var suite = IntegrationSuite(this);

  beforeEach(function() {
    suite.set('plugins', [
      Subject({
        id: 'test',
        baseURL: '/articles',
        verbose: false,
        source: 'lib/**/*.md'
      })
    ]);

    suite.createFile('lib/README.md', function() {;
      // # Hello!
      //
      // What buzzes and is not buzzy?
    });

    suite.createFile('lib/some/Scoped Article 2.md', function() {;
      // Some Article
      // ============
      //
      // Body.
    });
  });

  it('works', function(done) {
    suite.run(function(err, stats) {
      if (err) { return done(err); }

      assert.equal(stats['megadoc-plugin-markdown:test'].count, 2);

      suite.assertFileWasRendered('articles/readme.html', {
        text: 'What buzzes and is not buzzy?'
      });

      suite.assertFileWasRendered('articles/some-scoped-article-2.html', {
        text: 'Some Article'
      });

      done();
    });
  });

  it('works in single page mode', function(done) {
    suite.engageSinglePageMode({
      match: { by: 'url', on: '*' },
      regions: [
        {
          name: 'Layout::Content',
          outlets: [
            { name: 'Markdown::Document', using: 'test/readme' },
            { name: 'Markdown::Document', using: 'test/some-scoped-article-2' },
          ]
        }
      ]
    });

    suite.run(function(err, stats) {
      if (err) { return done(err); }

      assert.equal(stats['megadoc-plugin-markdown:test'].count, 2);

      suite.assertFileWasRendered('index.html', {
        text: 'What buzzes and is not buzzy?'
      });

      suite.assertFileWasRendered('index.html', {
        text: 'Some Article'
      });

      done();
    });
  });
});