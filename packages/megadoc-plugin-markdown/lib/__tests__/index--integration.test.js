const path = require("path");
const { createIntegrationSuite } = require('megadoc-test-utils');

describe("[Integration] megadoc-plugin-markdown", function() {
  const suite = createIntegrationSuite(this);

  beforeEach(function() {
    suite.createFile('lib/README.md', `
      # Hello!

      What buzzes and is not buzzy?
    `);

    suite.createFile('lib/some/Scoped Article 2.md', `
      Some Article
      ============

      Body.
    `);
  });

  it('works', function(done) {
    suite.compile({
      sources: [{
        id: 'articles',
        include: [ path.join(suite.root, 'lib/**/*.md') ],
        processor: [ path.resolve(__dirname, '../index.js'), {
          id: 'articles',
          baseURL: '/articles',
        }]
      }],
    }, {}, function(err) {
      if (err) { return done(err); }

      suite.assertFileWasRendered('articles/readme.html', {
        text: 'What buzzes and is not buzzy?'
      });

      suite.assertFileWasRendered('articles/some-scoped-article-2.html', {
        text: 'Some Article'
      });

      done();
    });
  });
});