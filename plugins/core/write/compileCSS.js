var path = require('path');
var webpack = require('webpack');
var root = path.resolve(__dirname, '..', '..', '..');
var CORE_STYLE = path.resolve(root, 'ui', 'app', 'css', 'index.less');

module.exports = function compileCSS(compiler, config, done) {
  var files = [ CORE_STYLE ].concat(compiler.assets.styleSheets);
  var utils = compiler.utils;

  var webpackConfig = {
    output: {
      path: utils.getOutputPath(),
      filename: 'styles.js',
      jsonpFunction: 'webpackJsonp_CSS'
    },

    devtool: null,
    entry: files,

    resolve: {
      extensions: [ '', '.less', '.css' ],
      modulesDirectories: [ 'node_modules' ],
      fallback: path.resolve(root, 'ui', 'app', 'css')
    },

    resolveLoader: {
      root: path.resolve(root, 'node_modules'),
    },

    module: {
      loaders: [
        {
          test: /\.(png|woff|woff2|eot|ttf|svg)$/,
          loader: 'url-loader?limit=100000'
        },

        {
          test: /\.less$/,
          loader: 'style-loader!css-loader?importLoaders=1!less-loader'
        },

        {
          test: /\.css$/,
          loader: 'style-loader!css-loader?importLoaders=1'
        }
      ]
    },

    plugins: [
      new webpack.NoErrorsPlugin()
    ]
  };

  if (config.styleOverrides) {
    webpackConfig.resolve.modulesDirectories
      .unshift(path.dirname(utils.getAssetPath(config.styleOverrides)))
    ;
  }

  if (config.stylesheet) {
    webpackConfig.entry.push(utils.getAssetPath(config.stylesheet));
  }

  console.log('Compiling CSS assets:\n%s', JSON.stringify(files, null, 2));

  webpack(webpackConfig, function(err, stats) {
    if (err) {
      console.log('CSS compilation failed!!!', err);
      return done(err);
    }

    var jsonStats = stats.toJson();

    if (jsonStats.errors.length > 0) {
      return done(jsonStats.errors);
    }

    if (jsonStats.warnings.length > 0) {
      console.warn(jsonStats.warnings);
    }

    compiler.assets.addRuntimeScript(utils.getOutputPath('styles.js'));

    console.log('CSS assets generated.');

    done();
  });
};