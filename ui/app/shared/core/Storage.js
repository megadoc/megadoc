var EventEmitter = require('core/EventEmitter');

var emitter = new EventEmitter(['change']);

exports.get = function(key) {
  return JSON.parse(localStorage.getItem(key));
};

exports.set = function(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  emitter.emit('change');
};

exports.on = emitter.on;
exports.off = emitter.off;