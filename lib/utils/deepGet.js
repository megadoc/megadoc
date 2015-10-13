var deep = require('deep-get-set');

module.exports = function get(object, path, value) {
  if (arguments.length === 2) {
    return deep(object, path);
  }
  else {
    return deep(object, path, value);
  }
};