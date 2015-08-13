var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var path = require('path');
var config = require('./webpack.config');
var fs = require('fs');
var ROOT = path.join(__dirname);

var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || '8942';
var server;

config.entry.main = [
  'webpack/hot/dev-server',
  'webpack-dev-server/client?http://localhost:8942',
  config.entry.main
];

config.plugins.push(new webpack.HotModuleReplacementPlugin());

if (process.env.CONFIG_FILE) {
  config.entry.main.unshift(path.resolve(process.env.CONFIG_FILE));
}

// load local plugins that you're developing
if (fs.existsSync('./.local.js')) {
  config.entry.main.push('./.local.js');
}

config.module.loaders.filter(function(loader) {
  return loader.type === 'js';
})[0].loader += '!react-hot';

server = new WebpackDevServer(webpack(config), {
  contentBase: path.resolve(ROOT, 'app'),
  publicPath: config.output.publicPath,
  hot: true,
  quiet: false,
  noInfo: false,
  lazy: false,
  inline: true,
  watchDelay: 300,
  stats: { colors: true },
  historyApiFallback: true,
});

server.listen(port, host, function(err) {
  if (err) {
    console.error(err);
  }

  console.log('Hot server listening at ' + host +':'+ port);
});