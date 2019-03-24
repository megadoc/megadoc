const path = require('path');
const webpack = require('webpack');
const R = require('ramda');
const {
  generateInlinePlugin,
  webpackConfig,
  webpackVendorModules,
  WebpackExternalsPlugin,
  COMMON_BUNDLE,
  CONFIG_FILE,
  MAIN_BUNDLE,
  VENDOR_BUNDLE,
} = require('megadoc-html-serializer/addon');

module.exports = function configureWebpack({
  assets,
  assetUtils,
  additionalFiles,
  runtimeConfig,
  runtimeConfigFilePath,
  runtimeOutputPath,
  serializerConfig,
  tmpDir,
}) {
  const commonBundlePath = WebpackExternalsPlugin.apply({ outputDir: tmpDir });
  const inlinePluginPath = path.join(tmpDir, 'megadoc-plugin-inline.source.js');
  const createLoaders = R.compose(
    R.partial(addInlineCSSLoader, [{ assets }]),
    addReactHotLoader,
    cloneLoaders
  )

  const hasInlinePlugin = generateInlinePlugin({
    assetUtils,
    config: serializerConfig,
    outputPath: inlinePluginPath,
  });

  return Object.assign({}, webpackConfig, {
    devtool: 'eval',

    entry: createEntry({
      assets,
      additionalFiles,
      inlinePluginPath: hasInlinePlugin ? inlinePluginPath : null,
      runtimeConfig,
      runtimeConfigFilePath,

      commonBundlePath,
    }),

    module: Object.assign({}, webpackConfig.module, {
      loaders: createLoaders(webpackConfig.module.loaders)
    }),

    output: {
      path: tmpDir,
      publicPath: runtimeOutputPath,
      filename: '[name].js',
      library: '[name]',
      libraryTarget: 'umd',
      jsonpFunction: 'webpackJsonp_megadoc'
    },

    plugins: [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.CommonsChunkPlugin(VENDOR_BUNDLE, VENDOR_BUNDLE + '.js'),
      new webpack.optimize.DedupePlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      }),

      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),
      new webpack.BannerPlugin('GENERATED BY MEGADOC-HTML-LIVE-SERVER', {
        entryOnly: true
      })
    ],

    resolve: Object.assign({}, webpackConfig.resolve, {
      alias: Object.assign({}, webpackConfig.resolve.alias, {
        // no idea why we have to do this, otherwise react-hot-loader complains
        'react/lib/ReactMount': require.resolve('megadoc-html-serializer/node_modules/react-dom/lib/ReactMount.js'),
        'megadoc-config-file$': runtimeConfigFilePath,
      }),

      fallback: (webpackConfig.resolve.fallback || []).concat([
        path.join(
          path.dirname(
            require.resolve('megadoc-html-serializer/ui')
          ),
          'css'
        ),
      ])
    }),
  });
}

function createEntry({
  assets,
  additionalFiles,
  runtimeConfig,
  inlinePluginPath,
  commonBundlePath,
}) {
  return Object.assign({
    [VENDOR_BUNDLE]: [ require.resolve('webpack-hot-middleware/client.js') ]
      .concat(webpackVendorModules)
      .concat(additionalFiles)
      .concat(getStyleSheets({ assets }))
      .concat(path.resolve(__dirname, '../ui/hotLoadConfig.js'))
    ,

    [COMMON_BUNDLE]: commonBundlePath,
    [MAIN_BUNDLE]: require.resolve('megadoc-html-serializer/ui/index.js'),
  }, generatePluginEntry({
      inlinePluginPath,
      pluginNames: runtimeConfig.pluginNames || [],
    })
  );
}

function getStyleSheets({ assets }) {
  return assets.styleSheets;
}

function generatePluginEntry({ pluginNames, inlinePluginPath }) {
  return (
    pluginNames
      .filter(x => x !== 'megadoc-plugin-inline')
      .reduce(
        function(map, pluginName) {
          return Object.assign(map, {
            [pluginName]: require.resolve(pluginName + '/ui/index.js')
          });
        },
        {
          'megadoc-plugin-inline': inlinePluginPath || []
        }
      )
  );
}

function cloneLoaders(loaders) {
  return loaders.map(x => Object.assign({}, x))
}

function addReactHotLoader(loaders) {
  return loaders.map(function(loader) {
    if (loader.id === 'js-loaders') {
      return Object.assign({}, loader, {
        loaders: [require.resolve('react-hot-loader')].concat(loader.loaders),
        exclude: loader.exclude.concat([
          new RegExp(`${CONFIG_FILE}$`)
        ])
      });
    }
    else {
      return loader;
    }
  });
}

function addInlineCSSLoader({ assets }, loaders) {
  return loaders.concat([
    {
      test: /\.(png|woff|woff2|eot|ttf|svg)$/,
      loader: 'url-loader?limit=100000'
    },

    {
      test: /\.less$/,
      loaders: [
        'style-loader',
        'css-loader?importLoaders=1',
        'less-loader?' + JSON.stringify({
          modifyVars: assets.styleOverrides
        })
      ]
    },
  ]);
}