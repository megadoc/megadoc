const config = require('config');
const K = require('constants');
const EventEmitter = require('core/EventEmitter');
const invariant = require('utils/invariant');

let state = {
  layout: config.layout
};

let AppState = EventEmitter([ 'change', 'layoutChange' ]);

AppState.setLayout = function(newLayout) {
  invariant(K.AVAILABLE_LAYOUTS.indexOf(newLayout) > -1,
    `Layout must be one of ${K.AVAILABLE_LAYOUTS.join(',')}`
  );

  state.layout = newLayout;

  AppState.emit('layoutChange');
  AppState.emit('change');
};

AppState.getLayout = function() {
  return state.layout;
};

module.exports = AppState;
