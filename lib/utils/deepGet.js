var deep = require('deep-get-set');

module.exports = function get(object, path) {
  return deep(object, path);
};