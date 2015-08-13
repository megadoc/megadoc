var { extend } = require('lodash');

var resets = [];
var Store = function(spec) {
  var exports = extend({}, spec);
  var callbacks;
  var state = exports.state = {};

  exports.addChangeListener = function(callback) {
    callbacks.push(callback);
  };

  exports.removeChangeListener = function(callback) {
    var index = callbacks.indexOf(callback);

    if (index > -1) {
      callbacks.splice(index, 1);
    }
  };

  exports.getInitialState = exports.getInitialState || function() {
    return {};
  };

  exports.setState = function(newState) {
    extend(state, newState);
    exports.emitChange();
  };

  exports.emitChange = function() {
    callbacks.forEach(function(callback) {
      callback();
    });
  };

  /**
   * @private
   *
   * A hook for tests to reset the Store to its initial state. Override this
   * to restore any side-effects.
   *
   * Usually during the life-time of the app, we will never have to reset a
   * Store, but in tests we do.
   */
  exports.reset = function() {
    if (spec.reset) {
      spec.reset();
    }

    callbacks = [];
    state = exports.state = exports.getInitialState();
  };

  resets.push(exports.reset);

  exports.reset();

  return exports;
};

Store.resetAllStores = function() {
  resets.forEach(function(callback) { callback(); });
};

module.exports = Store;