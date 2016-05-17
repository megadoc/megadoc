var connect = require('connect');
var serveStatic = require('serve-static');
var modRewrite = require('connect-modrewrite');
var webpack = require('webpack');
var path = require('path');
var config = require('./webpack.config');
var ExternalsPlugin = require('./webpack/ExternalsPlugin');
var fs = require('fs-extra');
var http = require('http')
var assign = require('lodash').assign;
var K = require('./lib/HTMLSerializer__constants');

var CONTENT_HOST = process.env.HOST || '0.0.0.0';
var CONTENT_PORT = process.env.PORT || '8942';

var configFile = path.resolve(process.env.CONFIG_FILE);
var contentBase = path.dirname(configFile);
var window = global.window = {};

require(configFile);

var pluginNames = ['megadoc'].concat(global.window.CONFIG.pluginNames || []);

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
    filename: 'megadoc.js'
  };

  config.entry = {
    megadoc: [
      'webpack-hot-middleware/client',
    ].concat(generatePluginEntry(pluginNames).concat(
      process.argv.slice(2).map(function(x) { return path.resolve(x)}))
    ).concat(
      getStyleSheets()
    ),
  };

  config.module.loaders.some(function(loader) {
    if (loader.id === 'js-loaders') {
      loader.loaders.unshift('react-hot');
      return true;
    }
  });

  config.module.loaders.some(function(loader) {
    if (loader.id === 'less-loaders') {
      delete loader.loader;
      delete loader.query;

      loader.loaders = [
        'style',
        'css?importLoaders=1',
        'less?' + JSON.stringify({
          modifyVars: getStyleOverrides(pluginNames)
        })
      ];

      return true;
    }
  });

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
    '^/(' + K.VENDOR_BUNDLE + '.js|' + K.STYLE_BUNDLE + ')$ - [G]',
    '^/plugins/(' + pluginNames.join('|') + ').js$ - [G]',
  ]));

  app.use(serveStatic(contentBase, { etag: false }));

  http.createServer(app).listen(port, host, done);
}

function generatePluginEntry() {
  var basePath = path.resolve(__dirname, 'packages');

  return pluginNames.reduce(function(list, name) {
    trackFileIfExists('ui/index.js');

    function trackFileIfExists(fileName) {
      var filePath = path.join(basePath, name, fileName);

      if (fs.existsSync(filePath)) {
        list.push( filePath );
      }
    }

    return list;
  }, []);
}

function getStyleOverrides() {
  var basePath = path.resolve(__dirname, 'packages');

  return pluginNames.reduce(function(map, name) {
    var filePath = path.join(basePath, name, 'ui/styleOverrides.json');

    if (fs.existsSync(filePath)) {
      assign(map, require(filePath));
    }

    return map;
  }, {});
}

function getStyleSheets() {
  return window.CONFIG.sourceStyleSheets;
}