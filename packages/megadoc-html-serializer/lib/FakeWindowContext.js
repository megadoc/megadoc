module.exports = function FakeWindowContext(window, target) {
  const muddied = [];

  function expose(key, value) {
    if (!target.hasOwnProperty(key)) {
      target[key] = value;
      muddied.push(key);
    }
  }

  return {
    install: function() {
      target.window = window;

      window.localStorage = {
        setItem: function() {},
        removeItem: function() {},
        clear: function() {}
      };

      for (var key in window) {
        if (window.hasOwnProperty(key)) {
          expose(key, window[key]);
        }
      }
    },

    expose: expose,

    restore: function() {
      delete window.localStorage;

      muddied.forEach(function(key) {
        delete target[key];
      });

      muddied.splice(0);

      delete target['window'];
    }
  };
}
