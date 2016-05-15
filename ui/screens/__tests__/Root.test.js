const Subject = require('../Root');
const reactSuite = require('test_helpers/reactSuite');
const { assert } = require('chai');

describe('megadoc::Components::Root', function() {
  reactSuite(this, Subject, {
    config: {},
    location: {
      pathname: '/',
      protocol: 'http:',
      origin: 'http://localhost',
      hash: ''
    }
  });

  it('renders', function() {
    assert.ok(subject.isMounted());
  });
});