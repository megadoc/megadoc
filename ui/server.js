var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var path = require('path');
var config = require('./webpack.config');
var fs = require('fs-extra');
var _ = require('lodash');
var root = path.resolve(__dirname);

var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || '8942';
var contentBase = '/tmp/tinydoc';
var server;

config.entry = {
  main: [
    path.join(root, '.local.js'),
    path.join(root, 'app', 'index.js'),
    'webpack/hot/dev-server',
    'webpack-dev-server/client?http://' + (process.env.HOT_HOST || host) + ':' + port,
  ]
}

config.plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }),

  new webpack.HotModuleReplacementPlugin(),
];

config.module.loaders.filter(function(loader) {
  return loader.type === 'js';
})[0].loader += '!react-hot';

// so that loaders can be used by external files, like css assets
config.resolveLoader = {
  root: path.resolve(__dirname, '..', 'node_modules'),
};

if (fs.existsSync(contentBase)) {
  fs.removeSync(contentBase);
}

fs.ensureDirSync(contentBase);
fs.writeFileSync(
  contentBase + '/index.html',
  _.template(fs.readFileSync(path.join(root, 'app/index.tmpl.html')), 'utf-8')({
    title: 'tinydoc--dev',
    scripts: [ 'main.js' ]
  })
);

fs.symlinkSync(
  path.join(path.dirname(path.resolve(process.env.CONFIG_FILE)), 'assets'),
  path.join(contentBase, 'assets')
);
fs.symlinkSync(
  path.join(path.dirname(path.resolve(process.env.CONFIG_FILE)), 'plugins'),
  path.join(contentBase, 'plugins')
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