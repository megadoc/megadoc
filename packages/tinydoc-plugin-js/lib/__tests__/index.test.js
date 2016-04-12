var Subject = require("../");
var assert = require('chai').assert;
var TinyTestUtils = require('tinydoc/lib/TestUtils');
var multiline = require('multiline-slash');
var tinydoc = require('tinydoc');

describe("[Integration] tinydoc-plugin-js", function() {
  var database, registry, subject;
  var config;

  beforeEach(function() {
    config = TinyTestUtils.generateTestConfig({
      verbose: true,
      plugins: [
        Subject({
          verbose: true,
          routeName: 'js-test',
          source: TinyTestUtils.tempPath('lib/**/*.js')
        })
      ]
    });

    TinyTestUtils.createFile(multiline(function() {;
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
    }), 'lib/core/Cache.js');

    TinyTestUtils.createFile(multiline(function() {;
      // /**
      //  * @module
      //  * A module that utilizes [Cache]().
      //  */
      // function Store() {}
    }), 'lib/core/Store.js');
  });

  it('works', function(done) {
    var tiny = tinydoc(config, {
      scan: true,
      write: true,
      index: true,
      render: true,
      stats: true,
      purge: true
    });

    tiny.run(function(err, stats) {
      if (err) { return done(err); }

      assert.equal(stats['js-test'].count, 3);
      assert.equal(stats['js-test'].modules.count, 2);
      assert.equal(stats['js-test'].entities.count, 1);

      done();
    });
  });
});