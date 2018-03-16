const breakpoints = require('./breakpoints')
const compile = require('./compile');

exports.defaults = require('./config');
exports.run = compile;

Object.assign(exports, breakpoints);