var path = require('path');
var fs = require('fs-extra');
var console = new require('./Logger')('tinydoc');

module.exports = function(config) {
  return {
    assetPath: function(relativePath) {
      if (arguments.length > 1) {
        var fragments = [].slice.call(arguments);
        fragments.unshift(config.assetRoot);
        return path.resolve.apply(path, fragments);
      }

      return path.resolve(config.assetRoot, relativePath);
    },

    writeAsset: function(fileName, contents) {
      var filePath = this.assetPath(config.outputDir, fileName);
      var dirPath = path.dirname(filePath);

      fs.ensureDirSync(dirPath);
      fs.writeFileSync(filePath, contents);

      console.log('Written asset to ' + filePath);
    }
  };
};
