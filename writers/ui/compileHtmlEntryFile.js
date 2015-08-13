// var Promise = require('promise');
var fs = require('fs-extra');
var path = require('path');
var APP_DIR = path.resolve(__dirname, '..', '..', 'ui', 'app');

function compileHtmlEntryFile(publicPath, outputDir) {
  return new Promise(function(resolve, reject) {
    var rawHtml = fs.readFileSync(path.resolve(APP_DIR, 'index.html'), 'utf-8');

    var buildConfig = {
      publicPath: publicPath
    };

    fs.writeFileSync(
      path.resolve(outputDir, 'index.html'),
      rawHtml.replace('BUILD_CONFIG = {}',
        'BUILD_CONFIG = ' + JSON.stringify(buildConfig) + ';'
      )
    );

    resolve();
  });
}

module.exports = compileHtmlEntryFile;