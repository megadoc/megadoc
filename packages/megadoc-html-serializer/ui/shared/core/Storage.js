const console = require("console");
const EventEmitter = require('../../EventEmitter');
const emitter = new EventEmitter(['change']);
const createMemoryStorage = () => {
  const store = {};

  return {
    getItem(key) {
      return store[key];
    },

    hasItem(key) {
      return store.hasOwnProperty(key);
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

const storage = createMemoryStorage();
const defaultValues = {};

exports.get = function(key) {
  console.assert(defaultValues.hasOwnProperty(key),
    `You are attempting to access an unregistered storage key '${key}'.
    Please add this key to core/Storage.js.`
  );

  return storage.hasItem(key) ?
    storage.getItem(key) :
    defaultValues[key]
  ;
};

exports.set = function(key, value) {
  storage.setItem(key, value);
  emitter.emit('change');
};

exports.on = emitter.on;
exports.off = emitter.off;

exports.clear = function() {
  storage.clear();
  emitter.emit('change');
};

exports.register = function(key, defaultValue) {
  defaultValues[key] = defaultValue;
};
