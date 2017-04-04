#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const http = require('http')
const connect = require('connect');
const serveStatic = require('serve-static');
const modRewrite = require('connect-modrewrite');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const ExternalsPlugin = require('./webpack/ExternalsPlugin');
const { assign } = require('lodash');
const K = require('./lib/constants');
const ConfigUtils = require('megadoc-config-utils');
const SerializerDefaults = require('./lib/config');

const MEGADOC_SOURCE_ROOT = path.resolve(process.argv[2]);
const CONTENT_HOST = process.env.HOST || '0.0.0.0';
const CONTENT_PORT = process.env.PORT || '8942';

const { runtimeConfig, contentBase } = loadRuntimeConfig(path.resolve(process.env.CONFIG_FILE))
const pluginNames = runtimeConfig.pluginNames || [];

console.log('Serving from:', contentBase);

start(CONTENT_HOST, CONTENT_PORT, function(connectError) {
  if (connectError) {
    throw connectError;
  }

  console.log('Hot server listening at "http://%s:%s"', CONTENT_HOST, CONTENT_PORT);
});

function start(host, port, done) {
  var app = connect();
  var entry = {};

  ExternalsPlugin.apply();

  entry[K.VENDOR_BUNDLE] = [ 'webpack-hot-middleware/client' ]
    .concat(require('./webpack/vendorModules'))
    .concat(process.argv.slice(3).map(function(x) { return path.resolve(x)}))
    .concat(getStyleSheets())
  ;

  entry[K.COMMON_BUNDLE] = path.resolve(__dirname, './tmp/publicModules');
  entry[K.MAIN_BUNDLE] = path.resolve(__dirname, 'ui/index.js');

  Object.assign(entry, generatePluginEntry(pluginNames));

  webpackConfig.devtool = 'eval';
  webpackConfig.output = {
    path: path.resolve(__dirname, 'tmp/devserver'),
    publicPath: '/',
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd',
    jsonpFunction: 'webpackJsonp_megadoc'
  };

  webpackConfig.entry = entry;

  webpackConfig.module.loaders.some(function(loader) {
    if (loader.id === 'js-loaders') {
      loader.loaders.unshift('react-hot');
      return true;
    }
  });

  webpackConfig.module.loaders.some(function(loader) {
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

  webpackConfig.plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.CommonsChunkPlugin(K.VENDOR_BUNDLE, K.VENDOR_BUNDLE + '.js'),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),

    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ];

  const webpackCompiler = webpack(webpackConfig);

  app.use(require('webpack-dev-middleware')(webpackCompiler, {
    contentBase: contentBase,
    publicPath: '/',
    hot: false,
    quiet: false,
    noInfo: true,
    lazy: false,
    inline: false,
    watchOptions: {
      aggregateTimeout: 300,
    },
    stats: { colors: true },
    historyApiFallback: false,
  }));

  app.use(require('webpack-hot-middleware')(webpackCompiler));

  app.use(modRewrite([
    '^/(' +
      K.VENDOR_BUNDLE + '.js|' +
      K.COMMON_BUNDLE + '.js|' +
      K.MAIN_BUNDLE   + '.js|' +
      K.STYLE_BUNDLE  +
    ')$ - [G]',
    '^/(' + pluginNames.join('|') + ').js$ - [G]',
  ]));

  app.use(serveStatic(contentBase, { etag: false }));

  http.createServer(app).listen(port, host, done);
}

function generatePluginEntry() {
  var basePath = path.join(MEGADOC_SOURCE_ROOT, 'packages');

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
  const basePath = path.join(MEGADOC_SOURCE_ROOT, 'packages');

  return pluginNames.concat([ 'userConfig' ]).reduce(function(map, name) {
    if (name === 'userConfig') {
      if (runtimeConfig.styleOverrides && typeof runtimeConfig.styleOverrides === 'object') {
        assign(map, runtimeConfig.styleOverrides);
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
  return runtimeConfig.sourceStyleSheets;
}

// TODO: DRY up with megadoc-cli/lib/megadoc.js
function loadRuntimeConfig(compilerConfigFilePath) {
  const compilerConfig = reverseMerge(require(compilerConfigFilePath), {
    assetRoot: path.resolve(path.dirname(compilerConfigFilePath))
  });

  const serializerSpec = ConfigUtils.getConfigurablePair(compilerConfig.serializer) || {
    name: 'megadoc-html-serializer'
  };

  const serializerConfig = reverseMerge(serializerSpec.options, SerializerDefaults);

  const runtimeConfigFilePath = path.resolve(
    compilerConfig.outputDir,
    serializerConfig.runtimeOutputPath,
    K.CONFIG_FILE
  );

  return {
    contentBase: path.resolve(compilerConfig.outputDir),
    runtimeConfig: require(runtimeConfigFilePath)
  };
}

function reverseMerge(target, source) {
  return Object.keys(source).reduce(function(map, key) {
    if (!map.hasOwnProperty(key) || map[key] === undefined) {
      map[key] = source[key];
    }

    return map;
  }, Object.assign({}, target))
}