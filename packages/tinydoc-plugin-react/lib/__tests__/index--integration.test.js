var Subject = require("../");
var assert = require('chai').assert;
var TinyTestUtils = require('tinydoc/lib/TestUtils');
var multiline = require('multiline-slash');
var tinydoc = require('tinydoc');
var TinydocPluginJS = require('tinydoc-plugin-js');

describe("[Integration] tinydoc-plugin-react", function() {
  TinyTestUtils.IntegrationSuite(this);

  var config;

  beforeEach(function() {
    config = TinyTestUtils.generateTestConfig({
      verbose: false,
      plugins: [
        TinydocPluginJS({
          verbose: false,
          routeName: 'test',
          source: TinyTestUtils.tempPath('lib/**/*.js'),
        }),

        Subject({ routeName: 'test', })
      ]
    });

    TinyTestUtils.createFile(multiline(function() {;
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
    }), 'lib/core/X.js');

    TinyTestUtils.createFile(multiline(function() {;
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
    }), 'lib/core/Y.js');
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

      assert.equal(stats['react:test'].componentCount, 2);
      assert.equal(stats['react:test'].liveExampleCount, 1);

      done();
    });
  });
});