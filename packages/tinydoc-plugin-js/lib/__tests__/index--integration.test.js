var Subject = require("../");
var assert = require('chai').assert;
var TinyTestUtils = require('tinydoc/lib/TestUtils');
var multiline = require('multiline-slash');
var tinydoc = require('tinydoc');
var fs = require('fs');

describe("[Integration] tinydoc-plugin-js", function() {
  TinyTestUtils.IntegrationSuite(this, 5000);

  var config;

  beforeEach(function() {
    config = TinyTestUtils.generateTestConfig({
      verbose: false,
      plugins: [
        Subject({
          verbose: false,
          routeName: 'test',
          source: 'lib/**/*.js'
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

      assert.equal(stats['js:test'].count, 3);
      assert.equal(stats['js:test'].modules.count, 2);
      assert.equal(stats['js:test'].entities.count, 1);

      done();
    });
  });

  it('works with file serializing', function(done) {
    config.emitFiles = true;
    config.useHashLocation = false;

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

      assert.equal(stats['js:test'].count, 3);
      assert.equal(stats['js:test'].modules.count, 2);
      assert.equal(stats['js:test'].entities.count, 1);

      assertFileWasRendered('test/Store.html');

      done();
    });
  });

  function assertFileWasRendered(fileName) {
    assert.ok(fs.existsSync(TinyTestUtils.tempPath('doc/compiled' + fileName)));
    assert.notOk(
      fs.readFileSync(TinyTestUtils.tempPath('doc/compiled' + fileName), 'utf-8').match(/404/),
      "It did not 404"
    );
  }
});