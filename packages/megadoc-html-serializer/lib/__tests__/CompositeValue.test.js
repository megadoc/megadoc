const { assert } = require('chai');
const CompositeValue = require('../CompositeValue');

describe('CompositeValue', function() {
  describe('#compute', function() {
    const subject = CompositeValue.compute;

    it('pipes reducers', function() {
      const reducers = {
        IDENTITY: function(x) {
          return x;
        },

        LINKIFY: function(x, reduce) {
          return reduce(x.text).replace(/\[\[(.+)\]\]/g, '<a href="foo">$1</a>')
        },

        RENDER_MARKDOWN: function(x) {
          return x.replace(/\*{1}(\w+)\*{1}/g, '<em>$1</em>')
        },
      };

      const text = 'Hello *World*! Click [[me]]!';
      const primitiveValue = subject(
        reducers,
        {
          $__type: 'IDENTITY',
          $__value: {
            $__type: 'LINKIFY',
            $__value: {
              text: {
                $__type: 'RENDER_MARKDOWN',
                $__value: text
              },
              contextNodeId: null
            }
          }
        }
      );

      assert.equal(primitiveValue, 'Hello <em>World</em>! Click <a href="foo">me</a>!')
    });

  });
});