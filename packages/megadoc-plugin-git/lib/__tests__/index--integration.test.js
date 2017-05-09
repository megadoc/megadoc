var Subject = require("../");
var assert = require('chai').assert;
var IntegrationSuite = require('megadoc-test-utils/LegacyTestUtils').IntegrationSuite;
var path = require('path');

describe("[Integration] megadoc-plugin-git", function() {
  var suite = IntegrationSuite(this);

  beforeEach(function() {
    suite.configure({
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
    suite.run(function(err, stats) {
      if (err) { return done(err); }

      assert.equal(stats['git:activity'].teamCount, 0);
      assert.isAtLeast(stats['git:activity'].peopleCount, 1);
      assert.isAtLeast(stats['git:activity'].totalCommitCount, 1);
      assert.isAtLeast(stats['git:activity'].recentCommitCount, 0);

      done();
    });
  });
});