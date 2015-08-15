var EventEmitter = require('core/EventEmitter');

var emitter = new EventEmitter(['change']);

exports.get = function(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch(e) {
    if (e.name.match(/SyntaxError/)) {
      var value = localStorage.getItem(key);
      localStorage.setItem(key, JSON.stringify(value));
      return value;
    }
    else {
      throw e;
    }
  }
};

exports.set = function(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  console.log('emitting change');
  emitter.emit('change');
};

exports.on = emitter.on;
exports.off = emitter.off;

exports.on('change', () => { console.log('>>> changed emitted <<< ')})