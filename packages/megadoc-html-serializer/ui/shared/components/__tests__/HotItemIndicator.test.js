const { HotItemIndicator } = require('../HotItemIndicator');
const Icon = require('../Icon');
const reactSuite = require('test_helpers/reactSuite');
const { assert } = require('chai');
const { drill } = require('react-drill');
const moment = require('test_helpers/moment');

describe('megadoc::Components::HotItemIndicator', function() {
  const rs = reactSuite(this, HotItemIndicator, {
    config: {},
    timestamp: 0,
  })

  let subject;

  beforeEach(function() {
    subject = rs.getSubject()
  })

  it('renders', function() {
    assert.ok(subject.isMounted())
  })

  const intervals = [
    'days',
    'weeks',
    // SKIP
    // 'months'
  ];
  intervals.forEach(function(interval) {
    context(`interval = "${interval}"`, function() {
      it('works if hot', function() {
        rs.setProps({
          config: {
            hotness: {
              interval,
              count: 2
            }
          },

          timestamp: moment().subtract(1, interval).unix()
        })

        assert.ok(drill(subject).find(Icon))
      });

      it('works if not hot', function() {
        rs.setProps({
          config: {
            hotness: {
              interval,
              count: 2
            }
          },

          timestamp: moment().subtract(2, interval).unix()
        })

        assert.notOk(drill(subject).has(Icon))
      })
    })
  });

});
