const path = require('path');

exports.configureFnPath = path.resolve(__dirname, 'configureFn.js');
exports.parseFnPath = require.resolve('./parseFn')
exports.reduceFnPath = require.resolve('./reduceFn')
exports.renderFnPath = path.resolve(__dirname, 'renderFn.js');
exports.reduceTreeFnPath = path.resolve(__dirname, 'reduceTreeFn.js');
exports.refineFnPath = path.resolve(__dirname, 'refineFn.js');