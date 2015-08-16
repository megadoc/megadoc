const moment = require('moment');
const config = require('config');
const hotness = config.hotness || {
  count: 1,
  interval: 'weeks'
};

function isItemHot(commitTs) {
  const since = moment().subtract(hotness.count, hotness.interval);
  const ts = moment(new Date(commitTs));

  return !ts.isBefore(since);
}

module.exports = isItemHot;
