var path = require('path');
var webpack = require('webpack');
var commonConfig = require('./webpack/common');
var nodeEnv = process.env.NODE_ENV || 'development';
var K = require('./lib/HTMLSerializer__constants');
var entry = {};

entry[K.MAIN_BUNDLE] = path.resolve(__dirname, 'ui/index.js');
entry[K.VENDOR_BUNDLE] = require('./webpack/vendorModules');

var config = {
  entry: entry,

  output: {
    path: K.BUNDLE_DIR,
    filename: '[name].js',
    libraryTarget: 'var',
    jsonpFunction: 'webpackJsonp_tinydoc'
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin(K.VENDOR_BUNDLE, K.VENDOR_BUNDLE + '.js'),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(nodeEnv)
    }),

    require('./webpack/ExternalsPlugin'),
  ]
};

if (nodeEnv === 'production' && process.env.OPTIMIZE !== '0') {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = commonConfig(config);
