var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var path = require('path');
var config = require('./webpack.config');
var ExternalsPlugin = require('./webpack/externals-plugin');
var fs = require('fs-extra');
var _ = require('lodash');

function symlinkAllDirectories(root) {
  fs.readdirSync(root)
    .filter(function(file) {
      return fs.statSync(path.join(root, file)).isDirectory();
    })
    .forEach(function(dir) {
      fs.symlinkSync(
        path.join(root, dir),
        path.join(contentBase, dir)
      );
    })
  ;
}

var root = path.resolve(__dirname);
var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || '8942';
var contentBase = '/tmp/tinydoc';
var server;
var configFile = path.resolve(process.env.CONFIG_FILE);

config.entry = {
  main: [
    path.join(root, '.local.js'),
    'webpack/hot/dev-server',
    'webpack-dev-server/client?http://' + (process.env.HOT_HOST || host) + ':' + port,
  ]
};

config.plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.CONFIG_FILE': JSON.stringify(configFile),
  }),

  new webpack.HotModuleReplacementPlugin(),

  ExternalsPlugin
];

config.resolve.alias['tinydoc-ui'] = path.join(root, 'app', 'shared');

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

symlinkAllDirectories(path.dirname(configFile));

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
    return;
  }

  console.log('Hot server listening at ' + host +':'+ port);
});