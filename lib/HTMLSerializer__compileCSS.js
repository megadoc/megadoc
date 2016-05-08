var path = require('path');
var webpack = require('webpack');
var root = path.resolve(__dirname, '..');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = function compileCSS(compiler, config, done) {
  var files = compiler.assets.styleSheets;
  var utils = compiler.utils;
  var lessQuery = JSON.stringify({
    modifyVars: compiler.assets.styleOverrides
  });

  var webpackConfig = {
    output: {
      path: utils.getOutputPath(),
      filename: 'styles.js',
      jsonpFunction: 'webpackJsonp_CSS'
    },

    devtool: null,
    entry: files,

    resolve: {
      extensions: [ '', '.less', '.css' ],
      modulesDirectories: [ 'node_modules' ],
      fallback: path.join(root, 'ui/css')
    },

    resolveLoader: {
      root: path.join(root, 'node_modules'),
    },

    module: {
      loaders: [
        {
          test: /\.(png|woff|woff2|eot|ttf|svg)$/,
          loader: 'url-loader?limit=100000'
        },

        {
          test: /\.less$/,
          loader: ExtractTextPlugin.extract(
            'style', 'css?importLoaders=1!less?' + lessQuery
          )
        },
      ]
    },

    plugins: [
      new webpack.NoErrorsPlugin(),
      new ExtractTextPlugin("styles.css"),
    ]
  };

  if (config.styleOverrides) {
    webpackConfig.resolve.modulesDirectories
      .unshift(path.dirname(utils.getAssetPath(config.styleOverrides)))
    ;
  }

  if (config.stylesheet) {
    webpackConfig.entry.push(utils.getAssetPath(config.stylesheet));
  }

  if (config.verbose) {
    console.log('Compiling CSS assets:\n%s', JSON.stringify(files, null, 2));
  }

  webpack(webpackConfig, function(err, stats) {
    if (err) {
      console.error('CSS compilation failed!!!');
      console.error(err.stack || err);

      return done(err);
    }

    var jsonStats = stats.toJson();

    if (jsonStats.errors.length > 0) {
      return done(jsonStats.errors);
    }

    jsonStats.warnings.forEach(function(message) {
      console.warn(message);
    });

    // compiler.assets.addRuntimeScript('styles.js');

    if (config.verbose) {
      console.log('CSS assets generated.');
    }

    done();
  });
};