var path = require('path');
var glob = require('glob');
var webpack = require('webpack');
var commonConfig = require('./webpack/common');
var root = path.resolve(__dirname);

var nodeEnv = process.env.NODE_ENV || 'development';
var config = {
  entry: {
    main: path.join(root, 'app/index.js')
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'this'
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin()
  ]
};

glob.sync(path.join(root, 'plugins/*/index.js')).forEach(function(entryFile) {
  var pluginName = path.basename(path.dirname(entryFile));
  config.entry['plugins/' + pluginName] = entryFile;
});

if (nodeEnv === 'production' && process.env.OPTIMIZE !== '0') {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = commonConfig(config);
