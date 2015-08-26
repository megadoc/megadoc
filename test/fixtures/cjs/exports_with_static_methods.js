const { func } = require('PropTypes');
const NullRouter = require('core/NullRouter');

/**
 * @module Transitioner
 *
 * Utility for components that need to perform routing transitions manually.
 */
var Transitioner = exports;

exports.contextTypes = {
  emberRouter: func
};

/**
 * Able to transition?
 */
exports.canTransition = function() {
};
