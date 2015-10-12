var path = require('path');
var extend = require('lodash').extend;
var root = path.resolve(__dirname, '..');

var nodeEnv = process.env.NODE_ENV;
var jsLoaders = [ 'babel-loader' ];

if (process.env.NODE_ENV === 'development') {
  jsLoaders.push('react-hot');
}

var baseConfig = {
  devtool: nodeEnv === 'production' ? null : 'eval',

  resolve: {
    // We will make webpack look in our own node_modules/ first so that any
    // look-up from plugins to libraries we support, like react and lodash,
    // won't resolve to that plugin's version of the library in its
    // node_modules/ folder.
    root: [
      path.resolve(__dirname, '..', '..', 'node_modules'),
      path.resolve(root, 'app', 'shims')
    ],

    fallback: [
      path.join(root, 'app', 'shared'),
      path.join(root, 'app', 'css'),
    ],

    modulesDirectories: [
      'css',
      'shared',
      'node_modules'
    ],

    alias: {
      'tinydoc': path.join(__dirname, '..', '..')
    }
  },

  resolveLoader: {
    root: path.resolve(__dirname, '..', '..', 'node_modules'),
  },

  node: {
    Buffer: false
  },

  module: {
    noParse: [/vendor\/moment/, /dist\//],

    loaders: [
      {
        test: /\.js$/,
        exclude: [
          /\.tmpl\.js$/,
          /ui\/app\/vendor/,
          /node_modules/
        ],
        loader: jsLoaders.join('!')
      },

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
  }
};

module.exports = function(overrides) {
  return extend({}, baseConfig, overrides);
};
