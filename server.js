var connect = require('connect');
var serveStatic = require('serve-static');
var modRewrite = require('connect-modrewrite');
var webpack = require('webpack');
var path = require('path');
var config = require('./webpack.config');
var ExternalsPlugin = require('./webpack/ExternalsPlugin');
var fs = require('fs-extra');
var http = require('http')

var CONTENT_HOST = process.env.HOST || '0.0.0.0';
var CONTENT_PORT = process.env.PORT || '8942';

var configFile = path.resolve(process.env.CONFIG_FILE);
var contentBase = path.dirname(configFile);

global.window = {};

require(configFile);

var pluginNames = ['tinydoc'].concat(global.window.CONFIG.pluginNames || []);

start(CONTENT_HOST, CONTENT_PORT, function(connectError) {
  if (connectError) {
    throw connectError;
  }

  console.log('Hot server listening at "http://%s:%s"', CONTENT_HOST, CONTENT_PORT);
});

function start(host, port, done) {
  var app = connect();
  var compiler;

  config.devtool = 'eval';
  config.output = {
    path: path.resolve(__dirname, 'tmp/devserver'),
    publicPath: '/',
    filename: 'tinydoc.js'
  };

  config.entry = {
    tinydoc: [
      'webpack-hot-middleware/client',
    ].concat(generatePluginEntry(pluginNames)),
  };

  console.log(config.entry);

  config.plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.CONFIG_FILE': JSON.stringify(configFile),
    }),

    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),

    ExternalsPlugin
  ];

  compiler = webpack(config);

  app.use(require('webpack-dev-middleware')(compiler, {
    contentBase: contentBase,
    publicPath: '/',
    hot: false,
    quiet: false,
    noInfo: true,
    lazy: false,
    inline: false,
    watchDelay: 300,
    stats: { colors: true },
    historyApiFallback: false,
  }));

  app.use(require('webpack-hot-middleware')(compiler));

  app.use(modRewrite([
    '^/(tinydoc__vendor|styles).js$ - [G]',
    '^/plugins/(' + pluginNames.join('|') + ').js$ - [G]',
  ]));

  app.use(serveStatic(contentBase, { etag: false }));

  http.createServer(app).listen(port, host, done);
}

function generatePluginEntry() {
  var basePath = path.resolve(__dirname, 'packages');

  return pluginNames.reduce(function(list, name) {
    trackFileIfExists('ui/index.js');
    trackFileIfExists('ui/index.less');
    trackFileIfExists('ui/css/index.less');

    function trackFileIfExists(fileName) {
      var filePath = path.join(basePath, name, fileName);

      if (fs.existsSync(filePath)) {
        list.push( filePath );
      }
    }

    return list;
  }, []);
}