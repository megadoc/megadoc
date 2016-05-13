var Subject = require("../");
var assert = require('chai').assert;
var IntegrationSuite = require('tinydoc/lib/TestUtils').IntegrationSuite;
var path = require('path');

describe("[Integration] tinydoc-plugin-lua", function() {
  var suite = IntegrationSuite(this);

  beforeEach(function() {
    suite.set('plugins', [
      Subject({
        verbose: false,
        routeName: 'lua-test',
        source: path.resolve(__dirname, 'fixtures/**/*.lua')
      })
    ]);
  });

  it('works', function(done) {
    suite.run(function(err, stats) {
      if (err) { return done(err); }

      assert.equal(stats['lua:lua-test'].moduleCount, 1);

      suite.assertFileWasRendered('lua-test/cli.html', {
        text: 'This here be our CLI module.'
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
          outlets: [{ name: 'Lua::AllModules', using: 'lua-test' }]
        }
      ]
    });

    suite.run(function(err, stats) {
      if (err) { return done(err); }

      assert.equal(stats['lua:lua-test'].moduleCount, 1);

      suite.assertFileWasRendered('index.html', {
        text: 'This here be our CLI module.'
      });

      done();
    });
  });
});