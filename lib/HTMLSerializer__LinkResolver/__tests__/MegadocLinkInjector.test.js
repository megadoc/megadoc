var subject = require("../MegadocLinkInjector");
var assert = require('chai').assert;
var TestUtils = require('megadoc/lib/TestUtils');

describe("HTMLSerializer__LinkResolver::MegadocLinkInjector", function() {
  var sinon = TestUtils.sinonSuite(this);

  [
    // works with no text
    {
      text: '[Foo]()',
      calls: [
        { path: 'Foo' }
      ]
    },

    // works with custom texts
    {
      text: '[Foo bar]()',
      calls: [{ path: 'Foo', text: 'bar'}]
    },

    // works with multiple matches
    {
      text: 'Gone to the [zoo]() where [monkeys]() hang out.',
      calls: [
        { path: 'zoo' },
        { path: 'monkeys' }
      ]
    },

    // ignores external links
    {
      text: 'Gone to the [zoo](http://google.com).',
      calls: [
      ]
    },
    // ignores external links with multiple words
    {
      text: 'Gone to the [super zoo](http://google.com).',
      calls: [
      ]
    }
  ].forEach(function(spec) {
    it('works with "' + spec.text + '"', function() {
      var onResolve = sinon.stub();

      subject(spec.text, onResolve);

      assert.callCount(onResolve, spec.calls.length);

      spec.calls.forEach(function(callSpec, callIndex) {
        assert.include(onResolve.getCall(callIndex).args[0], callSpec);
      });
    });
  });
});