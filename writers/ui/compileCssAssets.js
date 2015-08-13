// var less = require('less');
var fs = require('fs-extra');
var path = require('path');
var UI_ROOT = path.resolve(__dirname, '..', '..', 'ui');
var webpack = require('webpack');
var webpackConfig = require(path.resolve(UI_ROOT, 'webpack.config.js'));
var extend = require('lodash').extend;

module.exports = function(assetRoot, config, plugins, outputDir) {
  var sourceFiles = [
    path.join(UI_ROOT, 'app', 'css', 'index.less')
  ];

  plugins.forEach(function(plugin) {
    if (plugin.options.stylesheet) {
      sourceFiles.push(plugin.options.stylesheet);
    }
  });

  console.log(sourceFiles);

  if (config.styleOverrides) {
    webpackConfig.resolve.modulesDirectories.unshift(path.dirname(config.styleOverrides));
  }

  if (config.stylesheet) {
    sourceFiles.push(path.resolve(assetRoot, config.stylesheet));
  }

  extend(webpackConfig, {
    output: extend(webpackConfig.output, {
      path: outputDir
    }),

    entry: {
      styles: sourceFiles
    }
  });

  webpackConfig.plugins.push(new webpack.NoErrorsPlugin());

  var compiler = new webpack(webpackConfig);

  // return less.render(sources.join('\n'), options).then(function(output) {
  return new Promise(function(resolve, reject) {
    compiler.run(function(err, stats) {
      if (err) {
        console.log('webpack CSS compilation failed!!!', err);
        return reject(err);
      }

      var jsonStats = stats.toJson();
      if (jsonStats.errors.length > 0) {
        return reject(jsonStats.errors);
      }
      else if (jsonStats.warnings.length > 0) {
        return reject(jsonStats.warnings);
      }

      resolve();
    });
  });
};