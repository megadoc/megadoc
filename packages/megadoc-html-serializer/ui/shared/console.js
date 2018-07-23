/* global global */
module.exports = typeof console !== 'undefined' ? console : (window.console || global.console);