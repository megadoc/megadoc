const React = require('react');
const Icon = require('components/Icon');
const ConfigReceiver = require('components/ConfigReceiver');
const { PropTypes } = React;
const ConfigType = {
  hotness: PropTypes.shape({
    count: PropTypes.number,
    interval: PropTypes.oneOf([ 'days', 'weeks', 'months' ]),
  }),
};

const DAY_MS = 1000 * 60 * 60 * 24;
const INTERVALS = {
  'days': DAY_MS,
  'weeks': DAY_MS * 7,
  'months': DAY_MS * 30,
}
const HotItemIndicator = React.createClass({
  propTypes: {
    config: PropTypes.shape(ConfigType).isRequired,
    timestamp: PropTypes.number.isRequired,
  },

  render() {
    if (!isItemHot(this.props.config.hotness || {}, this.props.timestamp)) {
      return null;
    }

    return (
      <Icon
        title="This document has been edited recently."
        className="icon-fire hot-item-indicator"
      />
    );
  }
});

module.exports = ConfigReceiver(HotItemIndicator, ConfigType);
module.exports.HotItemIndicator = HotItemIndicator;

function isItemHot(hotness, commitTs) {
  if (!commitTs) {
    return false;
  }

  const duration = INTERVALS[hotness.interval] * hotness.count;
  const ts = new Date(commitTs * 1000).getTime();
  const now = new Date().getTime();

  return now - ts < duration;
}