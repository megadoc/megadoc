const startDevServer = require('megadoc-html-live-server');
// const path = require('path');
// const connect = require('connect');
// const webpack = require('webpack');
// const http = require('http');
// const createWebpackDevMiddleware = require('webpack-dev-middleware');
// const createWebpackHotMiddleware = require('webpack-hot-middleware');
// const serveStatic = require('serve-static');
// const proxyAssets = require('./proxyAssets');
// const { CONFIG_FILE, STYLE_BUNDLE } = require('megadoc-html-serializer').K;

// const startDevServer = function({
//   compilerConfig,
//   host,
//   port,
//   sourceFiles,
//   tmpDir,
// }, done) {
//   const webpackConfig = {}
//   const app = connect();
//   const webpackCompiler = webpack(webpackConfig);
//   const contentBase = path.resolve(compilerConfig.assetRoot, compilerConfig.outputDir);
//   const runtimeOutputPath = compilerConfig.serializer[1].runtimeOutputPath || 'assets'

//   app.use(createWebpackDevMiddleware(webpackCompiler, {
//     contentBase,
//     publicPath: runtimeOutputPath,
//     hot: false,
//     quiet: false,
//     noInfo: true,
//     lazy: false,
//     inline: false,
//     watchOptions: {
//       aggregateTimeout: 300,
//     },
//     stats: { colors: true },
//     historyApiFallback: false,
//   }));

//   app.use(createWebpackHotMiddleware(webpackCompiler));

//   proxyAssets({
//     runtimeOutputPath,
//     files: [
//       `${CONFIG_FILE}`,
//       `${STYLE_BUNDLE}`,
//     ]
//   }, app)

//   app.use(serveStatic(contentBase, { etag: false }));

//   http.createServer(app).listen(port, host, done);
// }

process.on('message', function(options) {
  startDevServer(options, function(err) {
    if (err) {
      console.error('Unable to start the web server!');
      throw err;
    }

    process.send({ name: 'READY' });
  })
})

process.send({ name: 'ALIVE' });