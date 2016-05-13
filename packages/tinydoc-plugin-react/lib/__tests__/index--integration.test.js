var Subject = require("../");
var assert = require('chai').assert;
var IntegrationSuite = require('tinydoc/lib/TestUtils').IntegrationSuite;
var TinydocPluginJS = require('tinydoc-plugin-js');

describe("[Integration] tinydoc-plugin-react", function() {
  var suite = IntegrationSuite(this);

  beforeEach(function() {
    suite.set('plugins', [
      TinydocPluginJS({
        id: 'test',
        verbose: false,
        source: 'lib/**/*.js'
      }),

      Subject({ id: 'test', })
    ]);

    suite.createFile('lib/core/X.js', function() {;
      // /**
      //  * Hello baby!
      //  */
      // const X = React.createClass({
      //   render() {},
      //
      //   /** Get something. */
      //   getSomething() {
      //   }
      // });
    });

    suite.createFile('lib/core/Y.js', function() {;
      // /**
      //  * Hello honey!
      //  *
      //  * @example {jsx}
      //  *
      //  *     <Y />
      //  */
      // const Y = React.createClass({
      //   statics: {
      //     /**
      //      * Foo
      //      */
      //      getFoo() {}
      //   },
      //
      //   render() {}
      // });
      //
      // module.exports = Y;
    });
  });

  it('works', function(done) {
    suite.run(function(err, stats) {
      if (err) { return done(err); }

      assert.equal(stats['tinydoc-plugin-react:test'].componentCount, 2);
      assert.equal(stats['tinydoc-plugin-react:test'].liveExampleCount, 1);

      done();
    });
  });
});