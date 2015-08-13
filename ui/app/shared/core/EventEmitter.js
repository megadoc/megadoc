var EventEmitter = function(events) {
  var listeners = events.reduce(function(listeners, event) {
    listeners[event] = [];

    return listeners;
  }, {});

  function assertEventIsKnown(event) {
    if (!listeners.hasOwnProperty(event)) {
      throw new Error('Unknown plugin event "' + event + '"');
    }
  }

  return {
    on: function(event, callback) {
      assertEventIsKnown(event);

      listeners[event].push(callback);
    },

    off: function(event, callback) {
      assertEventIsKnown(event);

      var index = listeners[event].indexOf(callback);

      if (index > -1) {
        listeners.splice(index, 1);
      }
    },

    emit: function(event, ...args) {
      assertEventIsKnown(event);

      listeners[event].forEach(function(callback) {
        callback.apply(null, args);
      });
    },

    clear: function() {
      Object.keys(listeners).forEach(function(event) {
        listeners[event] = [];
      });
    }
  };
};

module.exports = EventEmitter;
