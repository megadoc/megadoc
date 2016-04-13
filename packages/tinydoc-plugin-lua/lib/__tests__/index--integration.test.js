var Subject = require("../");
var assert = require('chai').assert;
var TinyTestUtils = require('tinydoc/lib/TestUtils');
var tinydoc = require('tinydoc');
var multiline = require('multiline-slash');

describe("[Integration] tinydoc-plugin-lua", function() {
  TinyTestUtils.IntegrationSuite(this);

  var config;

  beforeEach(function() {
    config = TinyTestUtils.generateTestConfig({
      verbose: false,
      plugins: [
        Subject({
          verbose: false,
          routeName: 'lua-test',
          source: TinyTestUtils.tempPath('lib/**/*.lua')
        })
      ]
    });

    TinyTestUtils.createFile(multiline(function() {;
      // --- @module
      // local cli = {}
      //
      // return cli
    }), 'lib/main.lua');

    TinyTestUtils.createFile(multiline(function() {;
      // print("Hello World!")
    }), 'lib/another.lua');
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

      assert.equal(stats['lua:lua-test'].moduleCount, 1);

      done();
    });
  });
});