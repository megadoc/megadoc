var path = require('path');
var webpack = require('webpack');
var Promise = require('bluebird');

function CSSCompiler(assetPath) {
  this.stylesheets = [];
  this.assetPath = assetPath;
}

CSSCompiler.prototype.addStylesheet = function(path) {
  this.stylesheets.push(path);
};

CSSCompiler.prototype.run = function(config) {
  var files = this.stylesheets;
  var webpackConfig = {
    output: {
      path: this.assetPath(config.outputDir),
      filename: 'styles.js',
      jsonpFunction: 'webpackJsonp_CSS'
    },

    devtool: 'sourcemap',
    entry: files,

    resolve: {
      extensions: [ '', '.less', '.css' ],
      modulesDirectories: [ /*'css',*/ 'node_modules' ],
      fallback: path.resolve(__dirname, '..', 'ui', 'app', 'css')
    },

    resolveLoader: {
      root: path.resolve(__dirname, '..', 'node_modules'),
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
      .unshift(path.dirname(this.assetPath(config.styleOverrides)))
    ;
  }

  if (config.stylesheet) {
    webpackConfig.entry.push(this.assetPath(config.stylesheet));
  }

  console.log('Compiling CSS assets:\n%s', JSON.stringify(files, null, 2));

  return new Promise(function(resolve, reject) {
    var webpackCompiler = new webpack(webpackConfig);
    webpackCompiler.run(function(err, stats) {
      if (err) {
        console.log('CSS compilation failed!!!', err);
        return reject(err);
      }

      var jsonStats = stats.toJson();
      if (jsonStats.errors.length > 0) {
        return reject(jsonStats.errors);
      }
      else if (jsonStats.warnings.length > 0) {
        return reject(jsonStats.warnings);
      }

      console.log('CSS assets generated.');

      resolve();
    });
  });
};

module.exports = CSSCompiler;