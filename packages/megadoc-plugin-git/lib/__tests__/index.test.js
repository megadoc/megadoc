var TestUtils = require('tinydoc/lib/TestUtils');
var tinydocPluginGit = require('../');
var assert = require('chai').assert;
var path = require('path');
var b = require('tinydoc-corpus').Types.builders;

describe('tinydoc-plugin-git', function() {
  var compiler, plugin;

  beforeEach(function() {
    compiler = TestUtils.createCompiler();
    plugin = tinydocPluginGit({
      repository: path.resolve(__dirname, '..', '..', '..', '..', '.git')
    });

    plugin.run(compiler);
  });

  afterEach(function() {
    TestUtils.removeFiles();
  });

  describe('#scan', function() {
    it('works', function(done) {
      compiler.run({ scan: true }, function(err) {
        if (err) { return done(err); }

        assert.ok(plugin.stats.hasOwnProperty('recentCommits'));
        assert.ok(plugin.stats.history.commitCount > 0);

        done();
      });

    });
  });

  describe('#render', function() {
    beforeEach(function(done) {
      compiler.corpus.add(b.namespace({
        id: 'git',
        name: 'git',
        documents: [
          b.document({
            id: 'someFile',
            filePath: path.resolve(__dirname, '../index.js')
          })
        ]
      }));

      compiler.run({ scan: true, index: true, render: true }, done);
    });

    it('stats the files collected during scanning', function() {
      assert.ok(compiler.corpus.get('git/someFile').meta.gitStats);
    });

    it('renders subject and body of recent commits', function() {
      if (plugin.stats.recentCommits.length > 0) {
        plugin.stats.recentCommits.forEach(function(commit) {
          assert.ok(commit.hasOwnProperty('renderedSubject'));
          assert.ok(commit.hasOwnProperty('renderedBody'));
        });
      }
    });
  });
});