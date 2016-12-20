const React = require('react');
const moment = require('moment');
const Icon = require('components/Icon');
const ConfigReceiver = require('components/ConfigReceiver');
const { PropTypes } = React;
const ConfigType = {
  hotness: PropTypes.shape({
    count: PropTypes.number,
    interval: PropTypes.string,
  }),
};

const HotItemIndicator = React.createClass({
  propTypes: {
    config: PropTypes.shape(ConfigType).isRequired,
    timestamp: PropTypes.string.isRequired,
  },

  render() {
    if (!isItemHot(this.props.config.hotness || {}, this.props.timestamp)) {
      return null;
    }

    return (
      <Icon
        title="This item is hot! It has been edited recently."
        className="icon-fire hot-item-indicator"
      />
    );
  }
});

module.exports = ConfigReceiver(HotItemIndicator, ConfigType);

function isItemHot(hotness, commitTs) {
  const since = moment().subtract(hotness.count, hotness.interval);
  const ts = moment(new Date(commitTs * 1000));

  return !ts.isBefore(since);
}