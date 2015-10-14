var WebpackDevServer = require('webpack-dev-server');
var connect = require('connect');
var webpack = require('webpack');
var path = require('path');
var config = require('./webpack.config');
var ExternalsPlugin = require('./webpack/externals-plugin');
var fs = require('fs-extra');
var _ = require('lodash');
var http = require('http')

var root = path.resolve(__dirname);
var CONTENT_HOST = process.env.HOST || '0.0.0.0';
var CONTENT_PORT = process.env.PORT || '8942';
var WEBPACK_PORT = process.env.WEBPACK_PORT || '8943';

var contentBase = '/tmp/tinydoc';
var configFile = path.resolve(process.env.CONFIG_FILE);

setup();

startWebpackServer(CONTENT_HOST, WEBPACK_PORT, function(webpackError) {
  if (webpackError) {
    throw webpackError;
  }

  startContentServer(CONTENT_HOST, CONTENT_PORT, WEBPACK_PORT, function(connectError) {
    if (connectError) {
      throw connectError;
    }

    console.log('Hot server listening at "http://%s:%s"', CONTENT_HOST, CONTENT_PORT);
  });
});

function setup() {
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
}

function startWebpackServer(host, port, done) {
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

  var devServer = new WebpackDevServer(webpack(config), {
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

  devServer.listen(port, host, done);
}

function startContentServer(host, port, proxyPort, done) {
  var serveStatic = require('serve-static');
  var modRewrite = require('connect-modrewrite');

  var app = connect();

  app.use(serveStatic(contentBase, { etag: false }));
  app.use(modRewrite([
    '^/(.*.js)$ http://' + host + ':' + proxyPort + '/$1 [P]',
    '^/(.*).hot-update.(js|json)$ http://' + host + ':' + proxyPort + '/$1.hot-update.$2 [P]',
    '^/(.*) http://' + host + ':' + proxyPort + '/index.html [P]',
  ]));

  http.createServer(app).listen(port, host, done);
}

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
