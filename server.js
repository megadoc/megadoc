var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var path = require('path');
var config = require('./webpack.config');
var ExternalsPlugin = require('./webpack/ExternalsPlugin');
var fs = require('fs-extra');
var _ = require('lodash');

var root = path.resolve(__dirname);
var host = process.env.HOST || 'localhost';
var port = process.env.PORT || '8942';
var contentBase = '/tmp/tinydoc';
var server;
var configFile = path.resolve(process.env.CONFIG_FILE);

config.devtool = 'eval';
config.entry = {
  main: [
    'webpack-dev-server/client?http://' + host + ':' + port,
    'webpack/hot/dev-server',

    path.join(root, '.local.js'),
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

config.resolve.alias['tinydoc-ui'] = path.join(root, 'ui', 'shared');
config.module.noParse.push(process.env.CONFIG_FILE);

if (fs.existsSync(contentBase)) {
  fs.removeSync(contentBase);
}

fs.ensureDirSync(contentBase);
fs.writeFileSync(
  contentBase + '/index.html',
  _.template(fs.readFileSync(path.join(root, 'ui/index.tmpl.html')), 'utf-8')({
    title: 'tinydoc--dev',
    metaDescription: '',
    scripts: [
      // 'webpack-dev-server/client?http://' + host + ':' + port,
      'main.js'
    ]
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
  inline: false,
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

// =--------------------------------------------------------------------------=
function symlinkAllDirectories(baseDir) {
  fs.readdirSync(baseDir)
    .filter(function(file) {
      return fs.statSync(path.join(baseDir, file)).isDirectory();
    })
    .forEach(function(dir) {
      fs.symlinkSync(
        path.join(baseDir, dir),
        path.join(contentBase, dir)
      );
    })
  ;
}
