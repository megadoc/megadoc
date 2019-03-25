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
      path.join(root, 'ui', 'shared'),
      path.join(root, 'node_modules'),
    ],

    modulesDirectories: [ 'node_modules' ],

    alias: {
      'moment': path.join(root, 'ui', 'shims', 'moment.js'),
      'sinon': path.join(root, 'ui', 'shims', 'sinon.js'),
    }
  },

  resolveLoader: {
    root: [
      path.join(root, 'node_modules'),
      // hoisted modules:
      path.resolve(root, '..', '..', 'node_modules'),
    ],
  },

  node: {
    Buffer: false
  },

  module: {
    noParse: [/vendor\/moment/, /dist\//],

    loaders: [
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=1048576'
      },
      {
        id: 'js-loaders',
        test: /\.js$/,
        exclude: [
          /\.tmpl\.js$/,
          /ui\/vendor/,
          /node_modules/
        ],
        loader: require.resolve('babel-loader'),
        query:{
          babelrc: false,
          presets: [
            require.resolve('babel-preset-es2015'),
            require.resolve('babel-preset-react'),
          ]
        }
      },
    ]
  }
};

module.exports = function(overrides) {
  return extend({}, baseConfig, overrides);
};
