var Subject = require("../");
var IntegrationSuite = require('megadoc-test-utils/LegacyTestUtils').IntegrationSuite;

describe("[Integration] megadoc-plugin-static", function() {
  var suite = IntegrationSuite(this);

  beforeEach(function() {
    suite.configure({
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

    suite.createFile('lib/README.md', function() {;
      // # Hello!
      //
      // What buzzes and is not buzzy?
    });
  });

  it('works', function(done) {
    suite.run(function(err) {
      if (err) { return done(err); }

      suite.assertFileWasRendered('readme.html', {
        text: 'What buzzes and is not buzzy?'
      });

      done();
    });
  });
});