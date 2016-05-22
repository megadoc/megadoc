const Subject = require('../describeNode');
const K = require('../../constants');
const { assert } = require('chai');

describe('JS::Utils::describeNode', function() {
  context('given an Object', function() {
    const FIXTURE = {
      type: K.TYPE_OBJECT,
      properties: [
        {
          type: K.TYPE_OBJECT_PROPERTY,
          key: 'foo',
          value: {
            type: K.TYPE_LITERAL,
            value: 'bar'
          }
        }
      ]
    };

    it('works', function() {
      assert.equal(Subject(FIXTURE), JSON.stringify({ foo: 'bar' }, null, 2));
    });
  });
});