var Subject = require("../");
var assert = require('chai').assert;
var TinyTestUtils = require('tinydoc/lib/TestUtils');
var tinydoc = require('tinydoc');
var path = require('path');

describe("[Integration] tinydoc-plugin-git", function() {
  TinyTestUtils.IntegrationSuite(this);

  var config;

  beforeEach(function() {
    config = TinyTestUtils.generateTestConfig({
      verbose: false,
      plugins: [
        Subject({
          verbose: false,
          routeName: 'activity',
          repository: path.resolve(__dirname, '../../../../.git')
        })
      ]
    });
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

      assert.equal(stats['git:activity'].teamCount, 0);
      assert.isAtLeast(stats['git:activity'].peopleCount, 1);
      assert.isAtLeast(stats['git:activity'].totalCommitCount, 1);
      assert.isAtLeast(stats['git:activity'].recentCommitCount, 0);

      done();
    });
  });
});