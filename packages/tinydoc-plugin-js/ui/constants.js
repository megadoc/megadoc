const PLUGIN_CONSTANTS = require('../lib/Parser/constants');
const { assign } = require('lodash');

assign(exports, PLUGIN_CONSTANTS, {
  CFG_CLASS_BROWSER_SHOW_PRIVATE: 'js:classBrowser:showPrivate'
});