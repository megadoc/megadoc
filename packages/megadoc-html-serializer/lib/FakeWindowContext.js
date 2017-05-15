module.exports = function FakeWindowContext(window, global) {
  const muddied = [];

  function expose(key, value) {
    if (!global.hasOwnProperty(key)) {
      global[key] = value;
      muddied.push(key);
    }
  }

  return {
    install: function() {
      global.window = window;

      window.localStorage = {
        setItem: function() {},
        removeItem: function() {},
        clear: function() {}
      };

      Object.keys(window).forEach(key => {
        expose(key, window[key]);
      })
    },

    expose: expose,

    restore: function() {
      delete window.localStorage;

      muddied.forEach(function(key) {
        delete global[key];
      });

      muddied.splice(0);

      delete global['window'];
    }
  };
}
