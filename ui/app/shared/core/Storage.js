var EventEmitter = require('core/EventEmitter');
var { findWhere } = require('lodash');
var emitter = new EventEmitter(['change']);

var STORAGE_ITEMS = [
  { key: 'colorScheme', defaultValue: 'plain' },
  { key: 'bannerCollapsed', defaultValue: true },
  { key: 'highlightingEnabled', defaultValue: true }
];

exports.get = function(key) {
  var value;
  var item = findWhere(STORAGE_ITEMS, { key });

  console.assert(!!item,
    `You are attempting to access an unregistered storage key '${key}'.
    Please add this key to core/Storage.js.`
  );

  if (!localStorage.hasOwnProperty(key)) {
    return item ? item.defaultValue : undefined;
  }

  try {
    value = JSON.parse(localStorage.getItem(key));
  }
  catch(e) {
    if (e.name.match(/SyntaxError/)) {
      value = localStorage.getItem(key);
      localStorage.setItem(key, JSON.stringify(value));
    }
    else {
      throw e;
    }
  }
  finally {
    if (value === undefined) {
      value = item ? item.defaultValue : undefined;
    }
  }

  return value;
};

exports.set = function(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  emitter.emit('change');
};

exports.on = emitter.on;
exports.off = emitter.off;

exports.clear = function() {
  localStorage.clear();
  emitter.emit('change');
};