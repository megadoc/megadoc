const console = require("console");
const EventEmitter = require('core/EventEmitter');
const emitter = new EventEmitter(['change']);
const createMemoryStorage = () => {
  const store = {};

  return {
    getItem(key) {
      return store[key];
    },

    setItem(key, value) {
      store[key] = value;
    },

    removeItem(key) {
      delete store[key];
    },

    clear() {
      Object.keys(store).forEach(key => { delete store[key] })
    }
  }
}

const storage = typeof localStorage === 'undefined' ? createMemoryStorage() : localStorage;

let STORAGE_ITEMS = {};

exports.get = function(key) {
  const defaultValue = STORAGE_ITEMS[key];
  let value;

  console.assert(STORAGE_ITEMS.hasOwnProperty(key),
    `You are attempting to access an unregistered storage key '${key}'.
    Please add this key to core/Storage.js.`
  );

  try {
    value = JSON.parse(storage.getItem(key));
  }
  catch(e) {
    if (e.name.match(/SyntaxError/)) {
      value = storage.getItem(key);
      storage.setItem(key, JSON.stringify(value));
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
  storage.setItem(key, JSON.stringify(value));
  emitter.emit('change');
};

exports.on = emitter.on;
exports.off = emitter.off;

exports.clear = function() {
  storage.clear();
  emitter.emit('change');
};

exports.register = function(key, defaultValue) {
  STORAGE_ITEMS[key] = defaultValue;
};
