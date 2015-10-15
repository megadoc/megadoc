var path = require('path');
var webpack = require('webpack');
var commonConfig = require('./webpack/common');
var nodeEnv = process.env.NODE_ENV || 'development';

var config = {
  entry: {
    main: path.resolve(__dirname, 'ui/index.js'),
    vendor: require('./webpack/vendorModules')
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'this',
    jsonpFunction: 'webpackJsonp_tinydoc'
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
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
