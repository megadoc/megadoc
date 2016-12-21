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
var clientExports = window.exports = {};

require(configFile);

var pluginNames = clientExports['megadoc__config'].pluginNames || [];

start(CONTENT_HOST, CONTENT_PORT, function(connectError) {
  if (connectError) {
    throw connectError;
  }

  console.log('Hot server listening at "http://%s:%s"', CONTENT_HOST, CONTENT_PORT);
});

function start(host, port, done) {
  var app = connect();
  var compiler;
  var entry = {};

  ExternalsPlugin.apply();

  entry[K.VENDOR_BUNDLE] = [ 'webpack-hot-middleware/client' ]
    .concat(require('./webpack/vendorModules'))
    .concat(process.argv.slice(2).map(function(x) { return path.resolve(x)}))
    .concat(getStyleSheets())
  ;

  entry[K.COMMON_BUNDLE] = path.resolve(__dirname, './tmp/publicModules');
  entry[K.MAIN_BUNDLE] = path.resolve(__dirname, 'ui/index.js');

  Object.assign(entry, generatePluginEntry(pluginNames));

  config.devtool = 'eval';
  config.output = {
    path: path.resolve(__dirname, 'tmp/devserver'),
    publicPath: '/',
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd',
    jsonpFunction: 'webpackJsonp_megadoc'
  };

  config.entry = entry;


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

  config.plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.CommonsChunkPlugin(K.VENDOR_BUNDLE, K.VENDOR_BUNDLE + '.js'),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),

    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
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
    '^/(' +
      K.VENDOR_BUNDLE + '.js|' +
      K.COMMON_BUNDLE + '.js|' +
      'megadoc.js|' +
      K.STYLE_BUNDLE +
    ')$ - [G]',
    '^/plugins/(' + pluginNames.join('|') + ').js$ - [G]',
  ]));

  app.use(serveStatic(contentBase, { etag: false }));

  http.createServer(app).listen(port, host, done);
}

function generatePluginEntry() {
  var basePath = path.resolve(__dirname, 'packages');

  return pluginNames.reduce(function(map, name) {
    trackFileIfExists('ui/index.js');

    function trackFileIfExists(fileName) {
      var filePath = path.join(basePath, name, fileName);

      if (fs.existsSync(filePath)) {
        map['plugins/' +name] = filePath;
      }
    }

    return map;
  }, {});
}

function getStyleOverrides() {
  const basePath = path.resolve(__dirname, 'packages');
  const clientConfig = getClientConfig();

  return pluginNames.concat([ 'userConfig' ]).reduce(function(map, name) {
    if (name === 'userConfig') {
      if (clientConfig.styleOverrides && typeof clientConfig.styleOverrides === 'object') {
        assign(map, clientConfig.styleOverrides);
      }
    }
    else {
      const filePath = path.join(basePath, name, 'ui/styleOverrides.json');

      if (fs.existsSync(filePath)) {
        assign(map, require(filePath));
      }
    }

    return map;
  }, {});
}

function getStyleSheets() {
  return getClientConfig().sourceStyleSheets;
}

function getClientConfig() {
  return clientExports['megadoc__config'];
}