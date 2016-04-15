module.exports = {
  for: function(routeName) {
    return window.tinydoc.getRuntimeConfigs('tinydoc-plugin-js').filter(function(config) {
      return config.routeName === routeName;
    })[0];
  }
};