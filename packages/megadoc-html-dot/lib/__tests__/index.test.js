const fs = require('fs');
const path = require('path');
const { assert, createIntegrationSuite } = require('megadoc-test-utils');

describe("megadoc-html-dot", function() {
  const suite = createIntegrationSuite(this);

  beforeEach(function() {
    suite.createFile('README.md', fs.readFileSync(path.resolve(__dirname, './fixture.md'), 'utf-8'));
  });

  it('works', function(done) {
    suite.compile({
      sources: [{
        include: path.join(suite.root, '**/*.md'),
        processor: 'megadoc-plugin-markdown',
        decorators: [ 'megadoc-html-dot' ]
      }]
    }, {}, function(err, stats) {
      if (err) { return done(err); }

      const { renderedCorpus } = stats;

      assert.include(renderedCorpus.toJSON()[1].properties.source, '</svg>')

      done();
    });
  });
});