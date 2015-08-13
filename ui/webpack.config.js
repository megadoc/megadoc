var path = require('path');
var glob = require('glob');
var webpack = require('webpack');
var commonConfig = require('./webpack/common');
var TINYDOC_ROOT = path.resolve(__dirname, '..');
var UI_ROOT = path.resolve(__dirname);

var nodeEnv = process.env.NODE_ENV || 'development';
var config = {
  entry: {
    main: './app/index.js',
    plugins: glob.sync('./plugins/*/index.js')
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'var'
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
    // new webpack.DefinePlugin({
    //   "process.env.NODE_ENV": JSON.stringify(nodeEnv)
    // }),
    new webpack.optimize.DedupePlugin()
  ]
};

if (nodeEnv === 'production' && process.env.OPTIMIZE !== '0') {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin());
  config.plugins.push(new webpack.NoErrorsPlugin());
}

module.exports = commonConfig(config);
