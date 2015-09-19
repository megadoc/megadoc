module.exports = {
  for: function(routeName) {
    return window.tinydoc.getRuntimeConfigs('cjs').filter(function(config) {
      return config.routeName === routeName;
    })[0];
  }
};