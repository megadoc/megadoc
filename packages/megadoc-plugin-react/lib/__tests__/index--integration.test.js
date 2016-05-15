var Subject = require("../");
var assert = require('chai').assert;
var IntegrationSuite = require('megadoc/lib/TestUtils').IntegrationSuite;
var MegadocPluginJS = require('megadoc-plugin-js');

describe("[Integration] megadoc-plugin-react", function() {
  var suite = IntegrationSuite(this);

  beforeEach(function() {
    suite.set('plugins', [
      MegadocPluginJS({
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

      assert.equal(stats['megadoc-plugin-react:test'].componentCount, 2);
      assert.equal(stats['megadoc-plugin-react:test'].liveExampleCount, 1);

      done();
    });
  });
});