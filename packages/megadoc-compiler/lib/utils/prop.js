const { curry } = require('lodash');

module.exports = curry(function prop(name, x) {
  return x[name];
})