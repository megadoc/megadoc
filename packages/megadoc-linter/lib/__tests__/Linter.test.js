const Subject = require("../Linter");
const { assert, sinonSuite } = require('megadoc-test-utils');

describe("megadoc-linter::Linter", function() {
  const sinon = sinonSuite(this);

  it('can be constructed', function() {
    const subject = Subject();

    assert.ok(subject);
  });

  describe('#push', function() {
    it('tracks my message', function() {
      const subject = Subject();

      subject.push({ message: 'something', type: 'foo' });

      assert.equal(subject.getMessages().length, 1);
    });

    it('emits a change', function() {
      const onChange = sinon.stub()
      const subject = Subject({
        onChange
      });

      subject.push({ message: 'something', type: 'foo' });

      assert.calledOnce(onChange);
    })
  })
});