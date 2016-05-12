var Subject = require("../");
var assert = require('chai').assert;
var TinyTestUtils = require('tinydoc/lib/TestUtils');
var tinydoc = require('tinydoc');
var multiline = require('multiline-slash');
var assign = require('lodash').assign;

describe("[Integration] tinydoc-plugin-static", function() {
  TinyTestUtils.IntegrationSuite(this);

  var config;

  beforeEach(function() {
    config = TinyTestUtils.generateTestConfig({
      verbose: false,
      plugins: [
        Subject({
          verbose: false,
          url: '/readme.html',
          outlet: 'test-outlet',
          source: 'lib/README.md'
        })
      ]
    });

    TinyTestUtils.createFile(multiline(function() {;
      // # Hello!
      //
      // What buzzes and is not buzzy?
    }), 'lib/README.md');
  });

  it('works', function(done) {
    var tiny = tinydoc(config, {
      scan: true,
      write: true,
      render: true,
      stats: true,
      purge: true
    });

    tiny.run(function(err, stats) {
      if (err) { return done(err); }

      TinyTestUtils.assertFileWasRendered('readme.html', {
        text: 'What buzzes and is not buzzy?'
      });

      done();
    });
  });
});