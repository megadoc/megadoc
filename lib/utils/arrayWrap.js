var isArray = Array.isArray || function(value) {
  return value instanceof Array;
};

module.exports = function wrap(value) {
  return isArray(value) ? value : value !== undefined ? [ value ] : [];
};