var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var path = require('path');
var config = require('./webpack.config');
var fs = require('fs-extra');
var _ = require('lodash');

var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || '8942';
var server;

config.entry = [
  'webpack/hot/dev-server',
  'webpack-dev-server/client?http://' + host + ':' + port,
  './app/index.js'
];

config.plugins.push(new webpack.HotModuleReplacementPlugin());

if (process.env.CONFIG_FILE) {
  config.entry.unshift(path.resolve(process.env.CONFIG_FILE));
}

// load local plugins that you're developing
if (fs.existsSync('./.local.js')) {
  config.entry.push('./.local.js');
}

config.module.loaders.filter(function(loader) {
  return loader.type === 'js';
})[0].loader += '!react-hot';

// so that loaders can be used by external files, like css assets
config.resolveLoader = {
  root: path.resolve(__dirname, '..', 'node_modules'),
};

var contentBase = '/tmp/tinydoc';

fs.ensureDirSync(contentBase);
fs.writeFileSync(
  contentBase + '/index.html',
  _.template(fs.readFileSync('./app/index.tmpl.html'), 'utf-8')({
    scripts: [ 'vendor.js', 'main.js' ]
  })
);

server = new WebpackDevServer(webpack(config), {
  contentBase: contentBase,
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