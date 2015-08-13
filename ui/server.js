var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var path = require('path');
var config = require('./webpack.config');
var fs = require('fs');
var ROOT = path.join(__dirname);

var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || '8942';
var server;

config.entry.index.unshift("webpack/hot/dev-server");
config.entry.index.unshift('webpack-dev-server/client?http://localhost:8942');
config.plugins.push(new webpack.HotModuleReplacementPlugin());

// load local plugins that you're developing
if (fs.existsSync('./.local.js')) {
  config.entry.index = config.entry.index.concat(require('./.local.js'));
}

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