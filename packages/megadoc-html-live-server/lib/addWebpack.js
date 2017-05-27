const webpack = require('webpack');
const createWebpackDevMiddleware = require('webpack-dev-middleware');
const createWebpackHotMiddleware = require('webpack-hot-middleware');

module.exports = function addWebpack({
  contentBase,
  runtimeOutputPath,
  webpackConfig,
}, app) {
  const webpackCompiler = webpack(webpackConfig);

  app.use(createWebpackDevMiddleware(webpackCompiler, {
    contentBase: contentBase,
    publicPath: runtimeOutputPath,
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

  app.use(createWebpackHotMiddleware(webpackCompiler));
}