var Subject = require("../");
var assert = require('chai').assert;
var IntegrationSuite = require('megadoc-test-utils/LegacyTestUtils').IntegrationSuite;

describe("[Integration] megadoc-plugin-js", function() {
  var suite = IntegrationSuite(this, { timeout: 5000 });

  beforeEach(function() {
    suite.set('plugins', [
      Subject({
        id: 'test',
        verbose: false,
        source: 'lib/**/*.js'
      })
    ]);

    suite.createFile('lib/core/Cache.js', function() {;
      // /**
      //  * @namespace Core
      //  * @module
      //  * @alias Foo
      //  * @alias Bar
      //  */
      // function Cache() {}
      //
      // /**
      //  * Add an item to the cache.
      //  */
      // Cache.prototype.add = function() {
      // };
    });

    suite.createFile('lib/core/Store.js', function() {;
      // /**
      //  * @module
      //  *
      //  * dis be our store, mon!
      //  */
      // function Store() {}
    });
  });

  it('works', function(done) {
    suite.run(function(err, stats) {
      if (err) { return done(err); }

      assert.equal(stats['js:test'].count, 3);
      assert.equal(stats['js:test'].modules.count, 2);
      assert.equal(stats['js:test'].entities.count, 1);

      suite.assertFileWasRendered('test/Core/Cache.html', {
        text: 'Add an item to the cache.'
      });

      suite.assertFileWasRendered('test/Store.html', {
        text: 'dis be our store, mon'
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
            { name: 'CJS::ModuleHeader', using: 'test/Core.Cache' },
            { name: 'CJS::ModuleBody', using: 'test/Core.Cache' },
            { name: 'CJS::ModuleHeader', using: 'test/Store' },
            { name: 'CJS::ModuleBody', using: 'test/Store' },
          ]
        }
      ]
    });

    suite.run(function(err, stats) {
      if (err) { return done(err); }

      console.log(stats['js:test'])

      assert.equal(stats['js:test'].count, 3);
      assert.equal(stats['js:test'].modules.count, 2);
      assert.equal(stats['js:test'].entities.count, 1);

      suite.assertFileWasRendered('index.html', {
        text: 'dis be our store, mon!'
      });

      done();
    });
  });
});