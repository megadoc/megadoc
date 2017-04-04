const defaults = require('./config');

module.exports = function(userOptions) {
  return Object.assign({}, defaults, userOptions);
};