var TestUtils = require('tinydoc/lib/TestUtils');
var tinydocPluginLua = require('../');
var assert = require('chai').assert;
var multiline = require('multiline-slash');

describe('tinydoc-plugin-lua', function() {
  var compiler;
  var plugin, getDatabase;

  TestUtils.IntegrationSuite(this);

  function createInlineSource(contents) {
    var filePath = TestUtils.createFile(multiline(contents), 'file.lua').path;
    plugin.configure({ source: [ filePath ] });
  }

  beforeEach(function() {
    compiler = TestUtils.createCompiler();
    plugin = tinydocPluginLua({
      source: [ '*.lua' ]
    });

    getDatabase = plugin.run(compiler);
  });

  describe('#scan', function() {
    it('works', function(done) {
      createInlineSource(function() {;
        // --- @module
        // function cli()
        // end
      });

      compiler.run({ scan: true }, function(err) {
        if (err) return done(err);

        assert.equal(getDatabase().length, 1);

        done();
      });
    });
  });

  describe('#index', function() {
    it('indexes modules', function(done) {
      createInlineSource(function() {;
        // --- @module
        // function cli()
        // end
      });

      compiler.run({ scan: true, index: true }, function(err) {
        if (err) return done(err);

        assert.equal(getDatabase().length, 1);
        assert.equal(compiler.registry.size, 3);

        assert.ok(compiler.registry.get('cli'));
        assert.ok(compiler.registry.get('file.lua'));
        assert.ok(compiler.registry.get('/file.lua'));

        done();
      });
    });

    it('indexes functions by #', function(done) {
      createInlineSource(function() {;
        // --- hello
        // function cli:hello()
        // end
      });

      compiler.run({ scan: true, index: true }, function(err) {
        if (err) return done(err);

        assert.equal(getDatabase().length, 1);
        assert.equal(compiler.registry.size, 1);

        assert.ok(compiler.registry.get('cli#hello'))
        done();
      });
    });
  });

  describe('#render', function() {
    beforeEach(function(done) {
      createInlineSource(function() {;
        // --- @module
        // function cli()
        // end
        //
        // --- hi!
        // function cli:hello()
        // end
      });

      compiler.run({ scan: true, index: true, render: true }, done);
    });

    it('resolves links to modules', function() {
      assert.deepEqual(compiler.linkResolver.lookup('cli'), {
        title: 'cli',
        href: 'lua/cli'
      });
    });

    it('resolves links to functions', function() {
      assert.deepEqual(compiler.linkResolver.lookup('cli#hello'), {
        title: 'cli#hello',
        href: 'lua/cli/%23hello'
      });
    });

    it('resolves a link to functions within the current module', function() {
      assert.deepEqual(compiler.linkResolver.lookup('#hello', 'cli'), {
        title: '#hello',
        href: 'lua/cli/%23hello'
      });
    });
  });
});