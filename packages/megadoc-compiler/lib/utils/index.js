const { curry } = require('lodash');

// http://ramdajs.com/docs/#props
exports.props = curry(function props(propNames, x) {
  return propNames.reduce((map, key) => Object.assign(map, { [key]: x[key] }), {})
});

// http://ramdajs.com/docs/#assoc
exports.assoc = curry(function assoc(propName, fn, x) {
  return Object.assign({}, x, { [propName]: fn(x) })
})

// http://ramdajs.com/docs/#view
exports.view = curry(function view(lens, f, x) {
  return f(lens(x))
})

// http://ramdajs.com/docs/#prop
exports.prop = require('./prop');

// http://ramdajs.com/docs/#indexBy
exports.indexBy = require('./indexBy');