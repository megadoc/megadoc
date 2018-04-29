const defaults = require('./config');

module.exports = function configure(userOptions) {
  return Object.assign({}, defaults, userOptions);
};
