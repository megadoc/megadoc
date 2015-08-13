var path = require('path');

module.exports = function(config) {
  return {
    resolvePath: function(relativePath) {
      if (arguments.length > 1) {
        var fragments = [].slice.call(arguments);
        fragments.unshift(config.root);
        return path.join.apply(path, fragments);
      }

      return path.join(config.root, relativePath);
    }
  };
};
