const path = require('path');
const webpack = require('webpack');
const R = require('ramda');
const { constants: K, generateInlinePlugin } = require('megadoc-html-serializer');
const baseWebpackConfig = require('megadoc-html-serializer/webpack.config');
const { apply: createPublicModules } = require('megadoc-html-serializer/webpack/ExternalsPlugin');
const webpackVendorModules = require('megadoc-html-serializer/webpack/vendorModules');

module.exports = function configureWebpack({
  assets,
  additionalFiles,
  runtimeConfig,
  runtimeOutputPath,
  serializerConfig,
  tmpDir,
}) {
  const commonBundlePath = createPublicModules({ outputDir: tmpDir });
  const inlinePluginPath = path.join(tmpDir, 'megadoc-plugin-inline.source.js');
  const createLoaders = R.compose(
    R.partial(addInlineCSSLoader, [{ assets }]),
    addReactHotLoader,
    cloneLoaders
  )

  const hasInlinePlugin = generateInlinePlugin({
    config: serializerConfig,
    outputPath: inlinePluginPath,
  });

  return Object.assign({}, baseWebpackConfig, {
    devtool: 'eval',

    entry: createEntry({
      assets,
      additionalFiles,
      inlinePluginPath: hasInlinePlugin ? inlinePluginPath : null,
      runtimeConfig,
      commonBundlePath,
    }),

    module: Object.assign({}, baseWebpackConfig.module, {
      loaders: createLoaders(baseWebpackConfig.module.loaders)
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
      new webpack.optimize.CommonsChunkPlugin(K.VENDOR_BUNDLE, K.VENDOR_BUNDLE + '.js'),
      new webpack.optimize.DedupePlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      }),

      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),
    ],

    resolve: Object.assign({}, baseWebpackConfig.resolve, {
      alias: Object.assign({}, baseWebpackConfig.resolve.alias, {
        // no idea why we have to do this, otherwise react-hot-loader complains
        'react/lib/ReactMount': require.resolve('megadoc-html-serializer/node_modules/react-dom/lib/ReactMount.js'),
      }),

      fallback: (baseWebpackConfig.resolve.fallback || []).concat([
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
    [K.VENDOR_BUNDLE]: [ require.resolve('webpack-hot-middleware/client.js') ]
      .concat(webpackVendorModules)
      .concat(additionalFiles)
      .concat(getStyleSheets({ assets }))
    ,

    [K.COMMON_BUNDLE]: commonBundlePath,
    [K.MAIN_BUNDLE]: require.resolve('megadoc-html-serializer/ui/index.js'),
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
        loaders: [require.resolve('react-hot-loader')].concat(loader.loaders)
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