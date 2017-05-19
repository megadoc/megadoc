const { curry } = require('lodash');

module.exports = curry(function indexBy(lens, list) {
  return list.reduce((map, object) => {
    return Object.assign(map, { [lens(object)]: object });
  }, {});
})