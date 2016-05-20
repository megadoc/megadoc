var subject = require("../MediaWikiLinkInjector");
var assert = require('chai').assert;
var TestUtils = require('megadoc/lib/TestUtils');

describe("HTMLSerializer__LinkResolver::MediaWikiLinkInjector", function() {
  var sinon = TestUtils.sinonSuite(this);

  [
    // works with no text
    {
      text: '[[Foo]]',
      calls: [
        { path: 'Foo' }
      ]
    },

    // works with custom text
    {
      text: '[[bar | Foo]]',
      calls: [{ path: 'Foo', text: 'bar'}]
    },

    // works with multiple matches
    {
      text: 'Gone to the [[zoo]] where [[monkeys]] chill.',
      calls: [
        { path: 'zoo' },
        { path: 'monkeys' }
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