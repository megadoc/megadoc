const invariant = require('utils/invariant');

function EventEmitter(events) {
  let assertEventIsKnown;
  let listeners = events.reduce(function(hash, event) {
    hash[event] = [];

    return hash;
  }, {});

  if (process.env.NODE_ENV === 'development') {
    assertEventIsKnown = function(event) {
      invariant(listeners.hasOwnProperty(event), `Unknown event "${event}".`);
    };
  }

  return {
    on(event, callback) {
      if (process.env.NODE_ENV === 'development') {
        assertEventIsKnown(event);
      }

      listeners[event].push(callback);
    },

    off(event, callback) {
      if (process.env.NODE_ENV === 'development') {
        assertEventIsKnown(event);
      }

      const index = listeners[event].indexOf(callback);

      if (index > -1) {
        listeners[event].splice(index, 1);
      }
    },

    emit(event, ...args) {
      if (process.env.NODE_ENV === 'development') {
        assertEventIsKnown(event);
      }

      listeners[event].forEach(function(callback) {
        callback.apply(null, args);
      });
    },

    clear() {
      Object.keys(listeners).forEach(function(event) {
        listeners[event] = [];
      });
    }
  };
}

module.exports = EventEmitter;
