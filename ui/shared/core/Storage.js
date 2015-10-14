const EventEmitter = require('core/EventEmitter');
const emitter = new EventEmitter(['change']);

let STORAGE_ITEMS = {};

exports.get = function(key) {
  const defaultValue = STORAGE_ITEMS[key];
  let value;

  console.assert(STORAGE_ITEMS.hasOwnProperty(key),
    `You are attempting to access an unregistered storage key '${key}'.
    Please add this key to core/Storage.js.`
  );

  if (!localStorage.hasOwnProperty(key)) {
    return defaultValue;
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
      value = defaultValue;
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

exports.register = function(key, defaultValue) {
  console.assert(!STORAGE_ITEMS.hasOwnProperty(key),
    `Key ${key} is already taken.`
  );

  STORAGE_ITEMS[key] = defaultValue;
};
