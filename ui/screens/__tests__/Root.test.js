const Subject = require('../Root');
const reactSuite = require('test_helpers/reactSuite');
const { assert } = require('chai');

describe('tinydoc::Components::Root', function() {
  reactSuite(this, Subject, {
    params: {},
    pathname: '/'
  });

  it('renders', function() {
    assert.ok(subject.isMounted());
  });
});