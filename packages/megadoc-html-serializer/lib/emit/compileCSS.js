const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const K = require('../constants');
const ROOT = K.ROOT;

module.exports = function compileCSS(config, state, done) {
  const files = state.assets.styleSheets;
  const assetUtils = state.assetUtils;
  const lessQuery = JSON.stringify({
    modifyVars: state.assets.styleOverrides
  });

  const webpackConfig = {
    output: {
      path: assetUtils.getOutputPath(config.runtimeOutputPath),
      filename: K.STYLE_BUNDLE,
      jsonpFunction: 'webpackJsonp_CSS'
    },

    devtool: null,
    entry: files,

    resolve: {
      extensions: [ '', '.less', '.css' ],
      modulesDirectories: [ 'node_modules' ],
      fallback: path.join(ROOT, 'ui/css')
    },

    resolveLoader: {
      root: path.join(ROOT, 'node_modules'),
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
      new ExtractTextPlugin(K.STYLE_BUNDLE),
    ]
  };

  if (config.verbose) {
    console.log('Compiling CSS assets:\n%s', JSON.stringify(files, null, 2));
  }

  webpack(webpackConfig, function(err, stats) {
    if (err) {
      console.error('CSS compilation failed!!!');
      console.error(err.stack || err);

      return done(err);
    }

    const jsonStats = stats.toJson();

    if (jsonStats.errors.length > 0) {
      return done(jsonStats.errors);
    }

    jsonStats.warnings.forEach(function(message) {
      console.warn(message);
    });

    if (config.verbose) {
      console.log('CSS assets generated.');
    }

    done();
  });
};