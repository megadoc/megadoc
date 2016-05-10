var Subject = require("../");
var assert = require('chai').assert;
var TinyTestUtils = require('tinydoc/lib/TestUtils');
var tinydoc = require('tinydoc');
var multiline = require('multiline-slash');
var assign = require('lodash').assign;

describe("[Integration] tinydoc-plugin-markdown", function() {
  TinyTestUtils.IntegrationSuite(this);

  var config;

  beforeEach(function() {
    config = TinyTestUtils.generateTestConfig({
      verbose: false,
      plugins: [
        Subject({
          verbose: false,
          routeName: 'test',
          source: 'lib/**/*.md'
        })
      ]
    });

    TinyTestUtils.createFile(multiline(function() {;
      // # Hello!
      //
      // What buzzes and is not buzzy?
    }), 'lib/README.md');

    TinyTestUtils.createFile(multiline(function() {;
      // Some Article
      // ============
      //
      // Body.
    }), 'lib/article.md');
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

      assert.equal(stats['tinydoc-plugin-markdown:test'].count, 2);

      done();
    });
  });

  it('works with emitting files', function(done) {
    var tiny = tinydoc(assign(config, {
      emitFiles: true,
    }), {
      scan: true,
      write: true,
      index: true,
      render: true,
      stats: true,
      purge: true
    });

    tiny.run(function(err, stats) {
      if (err) { return done(err); }

      assert.equal(stats['tinydoc-plugin-markdown:test'].count, 2);

      done();
    });
  });
});