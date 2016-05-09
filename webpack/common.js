var path = require('path');
var extend = require('lodash').extend;
var root = path.resolve(__dirname, '..');

var nodeEnv = process.env.NODE_ENV;

var baseConfig = {
  devtool: nodeEnv === 'production' ? null : 'eval',

  resolve: {
    // We will make webpack look in our own node_modules/ first so that any
    // look-up from plugins to libraries we support, like react and lodash,
    // won't resolve to that plugin's version of the library in its
    // node_modules/ folder.
    root: [
      path.join(root, 'node_modules'),
      path.join(root, 'ui', 'shims')
    ],

    fallback: [
      path.join(root, 'ui', 'shared'),
      path.join(root, 'ui', 'css'),
    ],

    modulesDirectories: [
      'css',
      'shared',
      'node_modules'
    ],

    alias: {
      'tinydoc': root,
      'sinon': path.join(root, 'ui', 'shims', 'sinon.js'),
    }
  },

  resolveLoader: {
    root: path.join(root, 'node_modules'),
  },

  node: {
    Buffer: false
  },

  module: {
    noParse: [/vendor\/moment/, /dist\//],

    loaders: [
      {
        id: 'js-loaders',
        test: /\.js$/,
        exclude: [
          /\.tmpl\.js$/,
          /ui\/vendor/,
          /node_modules/
        ],
        loaders: [ 'babel' ]
      },

      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      },

      {
        id: 'less-loaders',
        test: /\.less$/,
        loader: 'style-loader!css-loader?importLoaders=1!less-loader'
      },
    ]
  }
};

module.exports = function(overrides) {
  return extend({}, baseConfig, overrides);
};
