var path = require('path');
var glob = require('glob');
var webpack = require('webpack');
var commonConfig = require('./webpack/common');
var TINYDOC_ROOT = path.resolve(__dirname, '..');

var nodeEnv = process.env.NODE_ENV || 'development';
var config = {
  plugins: [],
  entry: {},

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "[name].js",
    libraryTarget: 'var'
  }
};

config.plugins.push(
  new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),

  new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify(nodeEnv),
    "process.env.CONFIG_FILE": JSON.stringify(process.env.CONFIG_FILE),
  })
);

config.plugins.push(new webpack.optimize.DedupePlugin());

config.entry.main = [
  './app/index.js',
  './app/index.build.js'
];

if (nodeEnv === 'production') {
  // config.entry.main.push('./app/index.build.js');

  config.plugins.push(new webpack.optimize.UglifyJsPlugin());
  config.plugins.push(new webpack.NoErrorsPlugin());
}

var plugins = glob.sync('*', { cwd: path.resolve(TINYDOC_ROOT, 'plugins') });

plugins.forEach(function(pluginName) {
  config.entry[pluginName] = path.resolve(TINYDOC_ROOT, 'plugins', pluginName, 'app', 'index.js');
});

module.exports = commonConfig(config);

