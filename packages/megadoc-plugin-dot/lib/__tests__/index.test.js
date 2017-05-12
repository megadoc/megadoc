var Subject = require("../index");
var fs = require('fs');
var path = require('path');
var IntegrationSuite = require('megadoc-test-utils/LegacyTestUtils').IntegrationSuite;

describe.skip("megadoc-plugin-dot", function() {
  var suite = IntegrationSuite(this);

  beforeEach(function() {
    suite.createFile('README.md', fs.readFileSync(path.resolve(__dirname, './fixture.md'), 'utf-8'));
    suite.set('plugins', [
      require('megadoc-plugin-markdown')({
        source: 'README.md'
      }),
      Subject()
    ]);
  });

  it('works', function(done) {
    suite.compiler.renderer.addCodeBlockRenderer('dot', function(code) {
      console.log('woohoo!');
      return code;
    });

    suite.run({ render: true, write: false, stats: true }, function(err, stats) {
      if (err) { return done(err); }

      console.log(stats);

      done();
    });
  });
});