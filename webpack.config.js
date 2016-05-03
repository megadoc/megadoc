var path = require('path');
var webpack = require('webpack');
var commonConfig = require('./webpack/common');
var nodeEnv = process.env.NODE_ENV || 'development';

var config = {
  entry: {
    tinydoc: path.resolve(__dirname, 'ui/index.js'),
    tinydoc__vendor: require('./webpack/vendorModules')
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'var',
    jsonpFunction: 'webpackJsonp_tinydoc'
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('tinydoc__vendor', 'tinydoc__vendor.js'),
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
