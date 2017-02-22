var path = require('path');
var webpack = require('webpack');
var commonConfig = require('./webpack/common');
var nodeEnv = process.env.NODE_ENV || 'development';
var K = require('./lib/constants');
var entry = {};
var ExternalsPlugin = require('./webpack/ExternalsPlugin');

ExternalsPlugin.apply();

entry[K.MAIN_BUNDLE] = path.resolve(__dirname, 'ui/index.js');
entry[K.VENDOR_BUNDLE] = require('./webpack/vendorModules');
entry[K.COMMON_BUNDLE] = path.resolve(__dirname, './tmp/publicModules');

var config = {
  entry: entry,

  output: {
    path: K.BUNDLE_DIR,
    filename: '[name].js',
    libraryTarget: 'umd',
    library: '[name]',
    jsonpFunction: 'webpackJsonp_megadoc'
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin(K.VENDOR_BUNDLE, K.VENDOR_BUNDLE + '.js'),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(nodeEnv)
    }),
  ]
};

if (nodeEnv === 'production' && process.env.OPTIMIZE !== '0') {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = commonConfig(config);
