const config = require('config');
const K = require('constants');
const EventEmitter = require('core/EventEmitter');
const invariant = require('utils/invariant');

let state = {
  layout: config.layout,
  spotlightOpen: false,
  invertedTCL: false,
  singlePageMode: config.layoutOptions && config.layoutOptions.singlePageMode,
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

AppState.openSpotlight = function() {
  if (!AppState.isSpotlightOpen()) {
    state.spotlightOpen = true;
    AppState.emit('change');
  }
};

AppState.closeSpotlight = function() {
  if (AppState.isSpotlightOpen()) {
    state.spotlightOpen = false;
    AppState.emit('change');
  }
};

AppState.isSpotlightOpen = function() {
  return state.spotlightOpen;
};

AppState.inSinglePageMode = function() {
  return state.singlePageMode;
};

AppState.invertTwoColumnLayout = function() {
  if (!AppState.isTwoColumnLayoutInverted()) {
    state.invertedTCL = true;
    AppState.emit('change');
  }
};

AppState.restoreTwoColumnLayout = function() {
  if (AppState.isTwoColumnLayoutInverted()) {
    state.invertedTCL = false;
    AppState.emit('change');
  }
};

AppState.isTwoColumnLayoutInverted = function() {
  return state.invertedTCL;
};

module.exports = AppState;
